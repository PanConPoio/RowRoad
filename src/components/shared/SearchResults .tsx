import { Models } from "appwrite";
import Loader from "./Loader";
import GridPostList from "./GridPostList";

type SearchResultsProps = {
  isSearchFetching: boolean;
  searchedPosts: Models.Document[];
};

const SearchResults = ({
  isSearchFetching,
  searchedPosts,
}: SearchResultsProps) => {
  if (isSearchFetching) return <Loader />;

  //@ts-ignore
  if (searchedPosts && searchedPosts.documents.length > 0) {
    //@ts-ignore
    return <GridPostList posts={searchedPosts.documents} />;
  }

  return (
    <div className="flex-center flex-col w-full h-full">
                <img
                  src={"/assets/icons/no-posts.svg"}
                  alt="No posts"
                  width={80}
                  height={80}
                  className="mb-4"
                />
                <p className="text-light-4">No hay resultados</p>
    </div>
  );
};

export default SearchResults;