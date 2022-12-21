import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { Post } from "./post";

export interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  user: string;
}

export const Main = () => {
  const postsRef = collection(db, "posts");
  const [postList, setPostsList] = useState<Post[] | null>(null);

  const getPosts = async () => {
    const data = await getDocs(postsRef);
    setPostsList(
      data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Post[]
    );
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div>
      {postList?.map((post) => (
        <Post post={post} />
      ))}
    </div>
  );
};
