import {
  addDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../config/firebase";
import { Post as IPost } from "./main";

interface Props {
  post: IPost;
}

interface Like {
  userId: string;
  likeId: string;
}

export const Post = (props: Props) => {
  const { post } = props;

  const [likes, setLikes] = useState<Like[] | null>(null);

  const [user] = useAuthState(auth);

  const likesRef = collection(db, "likes");

  const likesDoc = query(likesRef, where("postId", "==", post.id));

  const likePost = async () => {
    try {
      const newDoc = await addDoc(likesRef, {
        userId: user?.uid,
        postId: post.id,
      });
      if (user) {
        setLikes((prev) =>
          prev
            ? [...prev, { userId: user.uid, likeId: newDoc.id }]
            : [{ userId: user.uid, likeId: newDoc.id }]
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLikes = async () => {
    const data = await getDocs(likesDoc);
    setLikes(
      data.docs.map((doc) => ({ userId: doc.data().userId, likeId: doc.id }))
    );
  };

  const removeLike = async () => {
    try {
      //get the specific like
      const likeToDeleteQuery = query(
        likesRef,
        where("postId", "==", post.id),
        where("userId", "==", user?.uid)
      );

      //getting like data
      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      const likeId = likeToDeleteData.docs[0].id;

      const likeToDelete = doc(db, "likes", likeId);

      await deleteDoc(likeToDelete);

      if (user) {
        setLikes((prev) => prev && prev.filter((like) => like.likeId !== likeId));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const hasUserLiked = likes?.find((like) => like.userId === user?.uid);

  useEffect(() => {
    getLikes();
  }, []);

  return (
    <div>
      <div className="title">
        <h1> {post.title} </h1>
      </div>

      <div className="description">
        <p> {post.description}</p>
      </div>

      <div className="footer">
        <p> @{post.user} </p>
        <button onClick={hasUserLiked ? removeLike : likePost}>
          {" "}
          {hasUserLiked ? <>&#128148;</> : <>&#128147;</>}
        </button>
        {likes && <p>Likes: {likes?.length} </p>}
      </div>
    </div>
  );
};
