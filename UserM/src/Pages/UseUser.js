import { useEffect, useState } from "react";
import { getUsers, subscribe } from "./UserStore";

export function useUsers() {
  const [users, setUsers] = useState(getUsers());

  useEffect(() => {
    return subscribe(() => setUsers([...getUsers()]));
  }, []);

  return users;
}