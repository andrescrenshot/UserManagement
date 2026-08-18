from binascii import hexlify
from datetime import date, datetime, timedelta
from decimal import Decimal

from pony import options
from pony.converting import timedelta2str
from pony.orm.ormtypes import RawSQL
from pony.py23compat import int_types
from pony.utils import datetime2timestamp, is_ident, throw


class AstError(Exception):
    pass


class Param:
    __slots__ = "converter", "id", "optimistic", "paramkey", "style"

    def __init__(self, paramstyle, paramkey, converter=None, optimistic=False):
        self.style = paramstyle
        self.id = None
        self.paramkey = paramkey
        self.converter = converter
        self.optimistic = optimistic

    def eval(self, values):
        varkey, i, j = self.paramkey
        value = values[varkey]
        if i is not None:
            t = type(value)
            if t is tuple:
                value = value[i]
            elif t is RawSQL:
                value = value.values[i]
            elif hasattr(value, "_get_items"):
                value = value._get_items()[i]
            else:
                assert False, t
        if j is not None:
            assert type(type(value)).__name__ == "EntityMeta"
            value = value._get_raw_pkval_()[j]
        converter = self.converter
        if value is not None and converter is not None:
            if converter.attr is None:
                value = converter.val2dbval(value)
            value = converter.py2sql(value)
        return value

    def __str__(self):
        paramstyle = self.style
        if paramstyle == "qmark":
            return "?"
        elif paramstyle == "format":
            return "%s"
        elif paramstyle == "numeric":
            return ":%d" % self.id
        elif paramstyle == "named":
            return ":p%d" % self.id
        elif paramstyle == "pyformat":
            return "%%(p%d)s" % self.id
        else:
            throw(NotImplementedError)

    def __repr__(self):
        return "%s(%r)" % (self.__class__.__name__, self.paramkey)


class CompositeParam(Param):
    __slots__ = "func", "items"

    def __init__(self, paramstyle, paramkey, items, func):
        for item in items:
            assert isinstance(item, (Param, Value)), item
        Param.__init__(self, paramstyle, paramkey)
        self.items = items
        self.func = func

    def eval(self, values):
        args = [
            item.eval(values) if isinstance(item, Param) else item.value
            for item in self.items
        ]
        return self.func(args)


class Value:
    __slots__ = "paramstyle", "value"

    def __init__(self, paramstyle, value):
        self.paramstyle = paramstyle
        self.value = value

    def __str__(self):
        value = self.value
        if value is None:
            return "null"
        if isinstance(value, bool):
            return (value and "1") or "0"
        if isinstance(value, str):
            return self.quote_str(value)
        if isinstance(value, datetime):
            return "TIMESTAMP " + self.quote_str(datetime2timestamp(value))
        if isinstance(value, date):
            return "DATE " + self.quote_str(str(value))
        if isinstance(value, timedelta):
            return "INTERVAL '%s' HOUR TO SECOND" % timedelta2str(value)
        if isinstance(value, (int, float, Decimal)):
            return str(value)
        if isinstance(value, bytes):
            return "X'%s'" % hexlify(value).decode("ascii")
        assert False, repr(value)  # pragma: no cover

    def __repr__(self):
        return "%s(%r)" % (self.__class__.__name__, self.value)

    def quote_str(self, s):
        if self.paramstyle in ("format", "pyformat"):
            s = s.replace("%", "%%")
        return "'%s'" % s.replace("'", "''")


def flat(tree):
    stack = [tree]
    result = []
    stack_pop = stack.pop
    stack_extend = stack.extend
    result_append = result.append
    while stack:
        x = stack_pop()
        if isinstance(x, str):
            result_append(x)
        else:
            try:
                stack_extend(x)
            except TypeError:
                result_append(x)
    return result[::-1]


def flat_conditions(conditions):
    result = []
    for condition in conditions:
        if condition[0] == "AND":
            result.extend(flat_conditions(condition[1:]))
        else:
            result.append(condition)
    return result


def join(delimiter, items):
    items = iter(items)
    try:
        result = [next(items)]
    except StopIteration:
        return []
    for item in items:
        result.append(delimiter)
        result.append(item)
    return result


def move_conditions_from_inner_join_to_where(sections):
    new_sections = list(sections)
    for i, section in enumerate(sections):
        if section[0] == "FROM":
            new_from_list = ["FROM"] + [list(item) for item in section[1:]]
            new_sections[i] = new_from_list
            if len(sections) > i + 1 and sections[i + 1][0] == "WHERE":
                new_where_list = list(sections[i + 1])
                new_sections[i + 1] = new_where_list
            else:
                new_where_list = ["WHERE"]
                new_sections.insert(i + 1, new_where_list)
            break
    else:
        return sections
    for join in new_from_list[2:]:
        if join[1] in ("TABLE", "SELECT") and len(join) == 4:
            new_where_list.append(join.pop())
    return new_sections


def make_binary_op(symbol, default_parentheses=False):
    def binary_op(builder, expr1, expr2, parentheses=None):
        if parentheses is None:
            parentheses = default_parentheses
        if parentheses:
            return "(", builder(expr1), symbol, builder(expr2), ")"
        return builder(expr1), symbol, builder(expr2)

    return binary_op


def make_unary_func(symbol):
    def unary_func(builder, expr):
        return "%s(" % symbol, builder(expr), ")"

    return unary_func


def indentable(method):
    def new_method(builder, *args, **kwargs):
        result = method(builder, *args, **kwargs)
        if builder.indent <= 1:
            return result
        return builder.indent_spaces * (builder.indent - 1), result

    new_method.__name__ = method.__name__
    return new_method


class SQLBuilder:
    dialect = None
    param_class = Param
    composite_param_class = CompositeParam
    value_class = Value
    indent_spaces = " " * 4
    least_func_name = "least"
    greatest_func_name = "greatest"

    def __init__(self, provider, ast):
        self.provider = provider
        self.quote_name = provider.quote_name
        self.paramstyle = paramstyle = provider.paramstyle
        self.ast = ast
        self.indent = 0
        self.keys = {}
        self.inner_join_syntax = options.INNER_JOIN_SYNTAX
        self.suppress_aliases = False
        self.result = flat(self(ast))
        params = tuple(x for x in self.result if isinstance(x, Param))
        layout = []
        for i, param in enumerate(params):
            if param.id is None:
                param.id = i + 1
            layout.append(param.paramkey)
        self.layout = layout
        self.sql = "".join(map(str, self.result)).rstrip("\n")
        if paramstyle in ("qmark", "format"):

            def adapter(values):
                return tuple(param.eval(values) for param in params)
        elif paramstyle == "numeric":

            def adapter(values):
                return tuple(param.eval(values) for param in params)
        elif paramstyle in ("named", "pyformat"):

            def adapter(values):
                return {"p%d" % param.id: param.eval(values) for param in params}
        else:
            throw(NotImplementedError, paramstyle)
        self.params = params
        self.adapter = adapter

    def __call__(self, ast):
        if isinstance(ast, str):
            throw(AstError, "An SQL AST list was expected. Got string: %r" % ast)
        symbol = ast[0]
        if not isinstance(symbol, str):
            throw(AstError, "Invalid node name in AST: %r" % ast)
        method = getattr(self, symbol, None)
        if method is None:
            throw(AstError, "Method not found: %s" % symbol)
        try:
            return method(*ast[1:])
        except TypeError:
            raise

    ##            traceback = sys.exc_info()[2]
    ##            if traceback.tb_next is None:
    ##                del traceback
    ##                throw(AstError, 'Invalid data for method %s: %r'
    ##                               % (symbol, ast[1:]))
    ##            else:
    ##                del traceback
    ##                raise
    def INSERT(self, table_name, columns, values, returning=None):
        return [
            "INSERT INTO ",
            self.quote_name(table_name),
            " (",
            join(", ", [self.quote_name(column) for column in columns]),
            ") VALUES (",
            join(", ", [self(value) for value in values]),
            ")",
        ]

    def DEFAULT(self):
        return "DEFAULT"

    def UPDATE(self, table_name, pairs, where=None):
        return [
            "UPDATE ",
            self.quote_name(table_name),
            "\nSET ",
            join(
                ", ",
                [(self.quote_name(name), " = ", self(param)) for name, param in pairs],
            ),
            (where and ["\n", self(where)]) or [],
        ]

    def DELETE(self, alias, from_ast, where=None):
        self.indent += 1
        if alias is not None:
            assert isinstance(alias, str)
            if not where:
                return "DELETE ", self.quote_name(alias), " ", self(from_ast)
            return (
                "DELETE ",
                self.quote_name(alias),
                " ",
                self(from_ast),
                self(where),
            )
        else:
            assert (
                from_ast[0] == "FROM"
                and len(from_ast) == 2
                and from_ast[1][1] == "TABLE"
            )
            alias = from_ast[1][0]
            if alias is not None:
                self.suppress_aliases = True
            if not where:
                return "DELETE ", self(from_ast)
            return "DELETE ", self(from_ast), self(where)

    def _subquery(self, *sections):
        self.indent += 1
        if not self.inner_join_syntax:
            sections = move_conditions_from_inner_join_to_where(sections)
        result = [self(s) for s in sections]
        self.indent -= 1
        return result

    def SELECT(self, *sections):
        prev_suppress_aliases = self.suppress_aliases
        self.suppress_aliases = False
        try:
            result = self._subquery(*sections)
            if self.indent:
                indent = self.indent_spaces * self.indent
                return "(\n", result, indent + ")"
            return result
        finally:
            self.suppress_aliases = prev_suppress_aliases

    def SELECT_FOR_UPDATE(self, nowait, skip_locked, *sections):
        assert not self.indent
        result = self.SELECT(*sections)
        nowait = " NOWAIT" if nowait else ""
        skip_locked = " SKIP LOCKED" if skip_locked else ""
        return result, "FOR UPDATE", nowait, skip_locked, "\n"

    def EXISTS(self, *sections):
        result = self._subquery(*sections)
        indent = self.indent_spaces * self.indent
        return "EXISTS (\n", indent, "SELECT 1\n", result, indent, ")"

    def NOT_EXISTS(self, *sections):
        return "NOT ", self.EXISTS(*sections)

    @indentable
    def ALL(self, *expr_list):
        exprs = [self(e) for e in expr_list]
        return "SELECT ", join(", ", exprs), "\n"

    @indentable
    def DISTINCT(self, *expr_list):
        exprs = [self(e) for e in expr_list]
        return "SELECT DISTINCT ", join(", ", exprs), "\n"

    @indentable
    def AGGREGATES(self, *expr_list):
        exprs = [self(e) for e in expr_list]
        return "SELECT ", join(", ", exprs), "\n"

    def AS(self, expr, alias):
        return self(expr), " AS ", self.quote_name(alias)

    def compound_name(self, name_parts):
        return ".".join((p and self.quote_name(p)) or "" for p in name_parts)

    def sql_join(self, join_type, sources):
        indent = self.indent_spaces * (self.indent - 1)
        indent2 = indent + self.indent_spaces
        result = [indent, "FROM "]
        for i, source in enumerate(sources):
            if len(source) == 3:
                alias, kind, x = source
                join_cond = None
            elif len(source) == 4:
                alias, kind, x, join_cond = source
            else:
                throw(AstError, "Invalid source in FROM section: %r" % source)
            if i > 0:
                if join_cond is None:
                    result.append(", ")
                else:
                    result += ["\n", indent, "  %s JOIN " % join_type]
            if self.suppress_aliases:
                alias = None
            elif alias is not None:
                alias = self.quote_name(alias)
            if kind == "TABLE":
                if isinstance(x, str):
                    result.append(self.quote_name(x))
                else:
                    result.append(self.compound_name(x))
                if alias is not None:
                    result += " ", alias  # Oracle does not support 'AS' here
            elif kind == "SELECT":
                if alias is None:
                    throw(AstError, "Subquery in FROM section must have an alias")
                result += (
                    self.SELECT(*x),
                    " ",
                    alias,
                )  # Oracle does not support 'AS' here
            else:
                throw(AstError, "Invalid source kind in FROM section: %r" % kind)
            if join_cond is not None:
                result += ["\n", indent2, "ON ", self(join_cond)]
        result.append("\n")
        return result

    def FROM(self, *sources):
        return self.sql_join("INNER", sources)

    def INNER_JOIN(self, *sources):
        self.inner_join_syntax = True
        return self.sql_join("INNER", sources)

    @indentable
    def LEFT_JOIN(self, *sources):
        return self.sql_join("LEFT", sources)

    def WHERE(self, *conditions):
        if not conditions:
            return ""
        conditions = flat_conditions(conditions)
        indent = self.indent_spaces * (self.indent - 1)
        result = [indent, "WHERE "]
        extend = result.extend
        extend((self(conditions[0]), "\n"))
        for condition in conditions[1:]:
            extend((indent, "  AND ", self(condition), "\n"))
        return result

    def HAVING(self, *conditions):
        if not conditions:
            return ""
        conditions = flat_conditions(conditions)
        indent = self.indent_spaces * (self.indent - 1)
        result = [indent, "HAVING "]
        extend = result.extend
        extend((self(conditions[0]), "\n"))
        for condition in conditions[1:]:
            extend((indent, "  AND ", self(condition), "\n"))
        return result

    @indentable
    def GROUP_BY(self, *expr_list):
        exprs = [self(e) for e in expr_list]
        return "GROUP BY ", join(", ", exprs), "\n"

    @indentable
    def UNION(self, kind, *sections):
        return "UNION ", kind, "\n", self.SELECT(*sections)

    @indentable
    def INTERSECT(self, *sections):
        return "INTERSECT\n", self.SELECT(*sections)

    @indentable
    def EXCEPT(self, *sections):
        return "EXCEPT\n", self.SELECT(*sections)

    @indentable
    def ORDER_BY(self, *order_list):
        result = ["ORDER BY "]
        result.extend(join(", ", [self(expr) for expr in order_list]))
        result.append("\n")
        return result

    def DESC(self, expr):
        return self(expr), " DESC"

    @indentable
    def LIMIT(self, limit, offset=None):
        if limit is None:
            limit = "null"
        else:
            assert isinstance(limit, int_types)
        assert offset is None or isinstance(offset, int)
        if offset:
            return "LIMIT %s OFFSET %d\n" % (limit, offset)
        else:
            return "LIMIT %s\n" % limit

    def COLUMN(self, table_alias, col_name):
        if self.suppress_aliases or not table_alias:
            return ["%s" % self.quote_name(col_name)]
        return ["%s.%s" % (self.quote_name(table_alias), self.quote_name(col_name))]

    def PARAM(self, paramkey, converter=None, optimistic=False):
        return self.make_param(self.param_class, paramkey, converter, optimistic)

    def make_param(self, param_class, paramkey, *args):
        keys = self.keys
        param = keys.get(paramkey)
        if param is None:
            param = param_class(self.paramstyle, paramkey, *args)
            keys[paramkey] = param
        return param

    def make_composite_param(self, paramkey, items, func):
        return self.make_param(self.composite_param_class, paramkey, items, func)

    def STAR(self, table_alias):
        return self.quote_name(table_alias), ".*"

    def ROW(self, *items):
        return "(", join(", ", map(self, items)), ")"

    def VALUE(self, value):
        return self.value_class(self.paramstyle, value)

    def AND(self, *cond_list):
        cond_list = [self(condition) for condition in cond_list]
        return join(" AND ", cond_list)

    def OR(self, *cond_list):
        cond_list = [self(condition) for condition in cond_list]
        return "(", join(" OR ", cond_list), ")"

    def NOT(self, condition):
        return "NOT (", self(condition), ")"

    def POW(self, expr1, expr2):
        return "power(", self(expr1), ", ", self(expr2), ")"

    EQ = make_binary_op(" = ")
    NE = make_binary_op(" <> ")
    LT = make_binary_op(" < ")
    LE = make_binary_op(" <= ")
    GT = make_binary_op(" > ")
    GE = make_binary_op(" >= ")
    ADD = make_binary_op(" + ", True)
    SUB = make_binary_op(" - ", True)
    MUL = make_binary_op(" * ", True)
    DIV = make_binary_op(" / ", True)
    FLOORDIV = make_binary_op(" / ", True)

    def MOD(self, a, b):
        symbol = " %% " if self.paramstyle in ("format", "pyformat") else " % "
        return "(", self(a), symbol, self(b), ")"

    def FLOAT_EQ(self, a, b):
        a, b = self(a), self(b)
        return (
            "abs(",
            a,
            " - ",
            b,
            ") / coalesce(nullif(greatest(abs(",
            a,
            "), abs(",
            b,
            ")), 0), 1) <= 1e-14",
        )

    def FLOAT_NE(self, a, b):
        a, b = self(a), self(b)
        return (
            "abs(",
            a,
            " - ",
            b,
            ") / coalesce(nullif(greatest(abs(",
            a,
            "), abs(",
            b,
            ")), 0), 1) > 1e-14",
        )

    def CONCAT(self, *args):
        return "(", join(" || ", map(self, args)), ")"

    def NEG(self, expr):
        return "-(", self(expr), ")"

    def IS_NULL(self, expr):
        return self(expr), " IS NULL"

    def IS_NOT_NULL(self, expr):
        return self(expr), " IS NOT NULL"

    def LIKE(self, expr, template, escape=None):
        result = self(expr), " LIKE ", self(template)
        if escape:
            result = result + (" ESCAPE ", self(escape))
        return result

    def NOT_LIKE(self, expr, template, escape=None):
        result = self(expr), " NOT LIKE ", self(template)
        if escape:
            result = result + (" ESCAPE ", self(escape))
        return result

    def BETWEEN(self, expr1, expr2, expr3):
        return self(expr1), " BETWEEN ", self(expr2), " AND ", self(expr3)

    def NOT_BETWEEN(self, expr1, expr2, expr3):
        return self(expr1), " NOT BETWEEN ", self(expr2), " AND ", self(expr3)

    def IN(self, expr1, x):
        if not x:
            return "0 = 1"
        if len(x) >= 1 and x[0] == "SELECT":
            return self(expr1), " IN ", self(x)
        expr_list = [self(expr) for expr in x]
        return self(expr1), " IN (", join(", ", expr_list), ")"

    def NOT_IN(self, expr1, x):
        if not x:
            return "1 = 1"
        if len(x) >= 1 and x[0] == "SELECT":
            return self(expr1), " NOT IN ", self(x)
        expr_list = [self(expr) for expr in x]
        return self(expr1), " NOT IN (", join(", ", expr_list), ")"

    def COUNT(self, distinct, *expr_list):
        assert distinct in (None, True, False)
        if not distinct:
            if not expr_list:
                return ["COUNT(*)"]
            if self.dialect == "PostgreSQL":
                return "COUNT(", self.ROW(*expr_list), ")"
            else:
                return "COUNT(", join(", ", map(self, expr_list)), ")"
        if not expr_list:
            throw(AstError, "COUNT(DISTINCT) without argument")
        if len(expr_list) == 1:
            return "COUNT(DISTINCT ", self(expr_list[0]), ")"

        if self.dialect == "PostgreSQL":
            return "COUNT(DISTINCT ", self.ROW(*expr_list), ")"
        elif self.dialect == "MySQL":
            return "COUNT(DISTINCT ", join(", ", map(self, expr_list)), ")"
        # Oracle and SQLite queries translated to completely different subquery syntax
        else:
            throw(NotImplementedError)  # This line must not be executed

    def SUM(self, distinct, expr):
        assert distinct in (None, True, False)
        return (
            (distinct and "coalesce(SUM(DISTINCT ") or "coalesce(SUM(",
            self(expr),
            "), 0)",
        )

    def AVG(self, distinct, expr):
        assert distinct in (None, True, False)
        return (distinct and "AVG(DISTINCT ") or "AVG(", self(expr), ")"

    def GROUP_CONCAT(self, distinct, expr, sep=None):
        assert distinct in (None, True, False)
        result = (
            (distinct and "GROUP_CONCAT(DISTINCT ") or "GROUP_CONCAT(",
            self(expr),
        )
        if sep is not None:
            if self.provider.dialect == "MySQL":
                result = result, " SEPARATOR ", self(sep)
            else:
                result = result, ", ", self(sep)
        return result, ")"

    UPPER = make_unary_func("upper")
    LOWER = make_unary_func("lower")
    LENGTH = make_unary_func("length")
    ABS = make_unary_func("abs")

    def COALESCE(self, *args):
        if len(args) < 2:
            assert False  # pragma: no cover
        return "coalesce(", join(", ", map(self, args)), ")"

    def MIN(self, distinct, *args):
        assert not distinct, distinct
        if len(args) == 0:
            assert False  # pragma: no cover
        elif len(args) == 1:
            fname = "MIN"
        else:
            fname = self.least_func_name
        return fname, "(", join(", ", map(self, args)), ")"

    def MAX(self, distinct, *args):
        assert not distinct, distinct
        if len(args) == 0:
            assert False  # pragma: no cover
        elif len(args) == 1:
            fname = "MAX"
        else:
            fname = self.greatest_func_name
        return fname, "(", join(", ", map(self, args)), ")"

    def SUBSTR(self, expr, start, len=None):
        if len is None:
            return "substr(", self(expr), ", ", self(start), ")"
        return "substr(", self(expr), ", ", self(start), ", ", self(len), ")"

    def STRING_SLICE(self, expr, start, stop):
        if start is None:
            start = ["VALUE", 0]

        if start[0] == "VALUE":
            start_value = start[1]
            if self.dialect == "PostgreSQL" and start_value < 0:
                index_sql = ["LENGTH", expr]
                if start_value < -1:
                    index_sql = ["SUB", index_sql, ["VALUE", -(start_value + 1)]]
            else:
                if start_value >= 0:
                    start_value += 1
                index_sql = ["VALUE", start_value]
        else:
            inner_sql = start
            then = ["ADD", inner_sql, ["VALUE", 1]]
            else_ = (
                ["ADD", ["LENGTH", expr], then]
                if self.dialect == "PostgreSQL"
                else inner_sql
            )
            index_sql = ["IF", ["GE", inner_sql, ["VALUE", 0]], then, else_]

        if stop is None:
            len_sql = None
        elif stop[0] == "VALUE":
            stop_value = stop[1]
            if start[0] == "VALUE":
                start_value = start[1]
                if start_value >= 0 and stop_value >= 0:
                    len_sql = ["VALUE", stop_value - start_value]
                elif start_value < 0 and stop_value < 0:
                    len_sql = ["VALUE", stop_value - start_value]
                elif start_value >= 0 and stop_value < 0:
                    len_sql = [
                        "SUB",
                        ["LENGTH", expr],
                        ["VALUE", start_value - stop_value],
                    ]
                    len_sql = ["MAX", False, len_sql, ["VALUE", 0]]
                elif start_value < 0 and stop_value >= 0:
                    len_sql = ["SUB", ["VALUE", stop_value + 1], index_sql]
                    len_sql = ["MAX", False, len_sql, ["VALUE", 0]]
                else:
                    assert False  # pragma: nocover1
            else:
                start_sql = ["COALESCE", start, ["VALUE", 0]]
                if stop_value >= 0:
                    start_positive = ["SUB", stop, start_sql]
                    start_negative = ["SUB", ["VALUE", stop_value + 1], index_sql]
                else:
                    start_positive = [
                        "SUB",
                        ["LENGTH", expr],
                        ["ADD", start_sql, ["VALUE", -stop_value]],
                    ]
                    start_negative = ["SUB", stop, start_sql]
                len_sql = [
                    "IF",
                    ["GE", start_sql, ["VALUE", 0]],
                    start_positive,
                    start_negative,
                ]
                len_sql = ["MAX", False, len_sql, ["VALUE", 0]]
        else:
            stop_sql = ["COALESCE", stop, ["VALUE", -1]]
            if start[0] == "VALUE":
                start_value = start[1]
                start_sql = ["VALUE", start_value]
                if start_value >= 0:
                    stop_positive = ["SUB", stop_sql, start_sql]
                    stop_negative = [
                        "SUB",
                        ["LENGTH", expr],
                        ["SUB", start_sql, stop_sql],
                    ]
                else:
                    stop_positive = ["SUB", ["ADD", stop_sql, ["VALUE", 1]], index_sql]
                    stop_negative = ["SUB", stop_sql, start_sql]
                len_sql = [
                    "IF",
                    ["GE", stop_sql, ["VALUE", 0]],
                    stop_positive,
                    stop_negative,
                ]
                len_sql = ["MAX", False, len_sql, ["VALUE", 0]]
            else:
                start_sql = ["COALESCE", start, ["VALUE", 0]]
                both_positive = ["SUB", stop_sql, start_sql]
                both_negative = both_positive
                start_positive = ["SUB", ["LENGTH", expr], ["SUB", start_sql, stop_sql]]
                stop_positive = ["SUB", ["ADD", stop_sql, ["VALUE", 1]], index_sql]
                len_sql = [
                    "CASE",
                    None,
                    [
                        (
                            [
                                "AND",
                                ["GE", start_sql, ["VALUE", 0]],
                                ["GE", stop_sql, ["VALUE", 0]],
                            ],
                            both_positive,
                        ),
                        (
                            [
                                "AND",
                                ["LT", start_sql, ["VALUE", 0]],
                                ["LT", stop_sql, ["VALUE", 0]],
                            ],
                            both_negative,
                        ),
                        (
                            [
                                "AND",
                                ["GE", start_sql, ["VALUE", 0]],
                                ["LT", stop_sql, ["VALUE", 0]],
                            ],
                            start_positive,
                        ),
                        (
                            [
                                "AND",
                                ["LT", start_sql, ["VALUE", 0]],
                                ["GE", stop_sql, ["VALUE", 0]],
                            ],
                            stop_positive,
                        ),
                    ],
                ]
                len_sql = ["MAX", False, len_sql, ["VALUE", 0]]
        sql = ["SUBSTR", expr, index_sql, len_sql]
        return self(sql)

    def CASE(self, expr, cases, default=None):
        if (
            expr is None
            and default is not None
            and default[0] == "CASE"
            and default[1] is None
        ):
            cases2, default2 = default[2:]
            return self.CASE(None, tuple(cases) + tuple(cases2), default2)
        result = ["case"]
        if expr is not None:
            result.append(" ")
            result.extend(self(expr))
        for condition, expr in cases:
            result.extend((" when ", self(condition), " then ", self(expr)))
        if default is not None:
            result.extend((" else ", self(default)))
        result.append(" end")
        return result

    def IF(self, cond, then, else_):
        return self.CASE(None, [(cond, then)], else_)

    def TRIM(self, expr, chars=None):
        if chars is None:
            return "trim(", self(expr), ")"
        return "trim(", self(expr), ", ", self(chars), ")"

    def LTRIM(self, expr, chars=None):
        if chars is None:
            return "ltrim(", self(expr), ")"
        return "ltrim(", self(expr), ", ", self(chars), ")"

    def RTRIM(self, expr, chars=None):
        if chars is None:
            return "rtrim(", self(expr), ")"
        return "rtrim(", self(expr), ", ", self(chars), ")"

    def REPLACE(self, str, from_, to):
        return "replace(", self(str), ", ", self(from_), ", ", self(to), ")"

    def TO_INT(self, expr):
        return "CAST(", self(expr), " AS integer)"

    def TO_STR(self, expr):
        return "CAST(", self(expr), " AS text)"

    def TO_REAL(self, expr):
        return "CAST(", self(expr), " AS real)"

    def TODAY(self):
        return "CURRENT_DATE"

    def NOW(self):
        return "CURRENT_TIMESTAMP"

    def DATE(self, expr):
        return "DATE(", self(expr), ")"

    def YEAR(self, expr):
        return "EXTRACT(YEAR FROM ", self(expr), ")"

    def MONTH(self, expr):
        return "EXTRACT(MONTH FROM ", self(expr), ")"

    def DAY(self, expr):
        return "EXTRACT(DAY FROM ", self(expr), ")"

    def HOUR(self, expr):
        return "EXTRACT(HOUR FROM ", self(expr), ")"

    def MINUTE(self, expr):
        return "EXTRACT(MINUTE FROM ", self(expr), ")"

    def SECOND(self, expr):
        return "EXTRACT(SECOND FROM ", self(expr), ")"

    def RANDOM(self):
        return "RAND()"

    def RAWSQL(self, sql):
        if isinstance(sql, str):
            return sql
        return [x if isinstance(x, str) else self(x) for x in sql]

    def build_json_path(self, path):
        empty_slice = slice(None, None, None)
        has_params = False
        has_wildcards = False
        items = [self(element) for element in path]
        for item in items:
            if isinstance(item, Param):
                has_params = True
            elif isinstance(item, Value):
                value = item.value
                if value is Ellipsis or value == empty_slice:
                    has_wildcards = True
                else:
                    assert isinstance(value, (int, str)), value
            else:
                assert False, item
        if has_params:
            paramkey = tuple(
                item.paramkey
                if isinstance(item, Param)
                else None
                if type(item.value) is slice
                else item.value
                for item in items
            )
            path_sql = self.make_composite_param(paramkey, items, self.eval_json_path)
        else:
            result_value = self.eval_json_path(item.value for item in items)
            path_sql = self.value_class(self.paramstyle, result_value)
        return path_sql, has_params, has_wildcards

    @classmethod
    def eval_json_path(cls, values):
        result = ["$"]
        append = result.append
        empty_slice = slice(None, None, None)
        for value in values:
            if isinstance(value, int):
                append("[%d]" % value)
            elif isinstance(value, str):
                append(
                    "." + value
                    if is_ident(value)
                    else '."%s"' % value.replace('"', '\\"')
                )
            elif value is Ellipsis:
                append(".*")
            elif value == empty_slice:
                append("[*]")
            else:
                assert False, value
        return "".join(result)

    def JSON_QUERY(self, expr, path):
        throw(NotImplementedError)

    def JSON_VALUE(self, expr, path, type):
        throw(NotImplementedError)

    def JSON_NONZERO(self, expr):
        throw(NotImplementedError)

    def JSON_CONCAT(self, left, right):
        throw(NotImplementedError)

    def JSON_CONTAINS(self, expr, path, key):
        throw(NotImplementedError)

    def JSON_ARRAY_LENGTH(self, value):
        throw(NotImplementedError)

    def JSON_PARAM(self, expr):
        return self(expr)

    def ARRAY_INDEX(self, col, index):
        throw(NotImplementedError)

    def ARRAY_CONTAINS(self, key, not_in, col):
        throw(NotImplementedError)

    def ARRAY_SUBSET(self, array1, not_in, array2):
        throw(NotImplementedError)

    def ARRAY_LENGTH(self, array):
        throw(NotImplementedError)

    def ARRAY_SLICE(self, array, start, stop):
        throw(NotImplementedError)

    def MAKE_ARRAY(self, *items):
        throw(NotImplementedError)
