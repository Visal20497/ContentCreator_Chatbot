import { ResultDocsFromVectorDB } from "@/lib/types";
import { atom } from "recoil";

export const AllDocsInVectorDBState = atom<ResultDocsFromVectorDB[]>({
  key: "vector_db_docs",
  default: [],
});
