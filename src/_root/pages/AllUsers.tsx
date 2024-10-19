import { useState } from "react";
import { useGetUsers, useGetCurrentUser } from "@/lib/appwrite/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UseCard";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import useDebounce from "@/hooks/useDebounce";

const AllUsers = () => {
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState("");
  const debouncedValue = useDebounce(searchValue, 500);

  const { data: users, isPending, isError: isErrorUsers } = useGetUsers();
  const { data: currentUser } = useGetCurrentUser();

  if (isErrorUsers) {
    toast({
      title: "Surgió un Error",
    });
    return null;
  }

  const filteredUsers = users?.documents.filter((user) =>
    (user.name.toLowerCase().includes(debouncedValue.toLowerCase()) ||
    user.username.toLowerCase().includes(debouncedValue.toLowerCase())) &&
    user.$id !== currentUser?.$id
  );

  return (
    <div className="common-container">
      <div className="user-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Todos los Usuarios</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4 mt-5 mb-7">
          <img
            src="/assets/icons/search.svg"
            alt="search"
            width={44}
            height={44}
          />
          <Input
            type="text"
            placeholder="Buscar usuarios"
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        {isPending && !users ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <li key={user.$id} className="flex-1 min-w-[300px] w-full">
                  <UserCard user={user} />
                </li>
              ))
            ) : (
              <p className="text-light-4 mt-10 text-center w-full">No se encontraron usuarios</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;