import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection,
  getDoc,
  getDocs,
  doc,
  query,
  where,
} from "firebase/firestore";
import { auth } from '../firebase'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/input'
import { Loader2, Search } from 'lucide-react'
import { Eye } from 'lucide-react'
import { onAuthStateChanged } from 'firebase/auth'
import { Skeleton } from '../components/ui/skeleton'
// import { Modal } from '../components/ui/modal'
import { useNavigate } from 'react-router-dom'

const Users = () => {

  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [isDataloading, setIsDataloading] = useState(false);
  const [error, setError] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);


  const getUsers = async () => {
   try {
    setIsDataloading(true);
    const currentUser = auth.currentUser;

    if (!currentUser) return;
    const user = await getDoc(doc(db, "users", currentUser.uid));

    if (!user.exists()) return;

    if (user.data().role !== "admin") {
      console.warn("Not authorized");
      return;
    }

    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", "user")
    );

    const getAllUsers = await getDocs(usersQuery);

    // console.log("getAllUsers", getAllUsers);

    const usersList = getAllUsers.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("usersList", usersList);

    setUsers(usersList);
  }
    catch (error) {
    setError(error.message);
    } finally {
    setIsDataloading(false);
   }
  }

  useEffect(() => {
    // Wait for Firebase auth state to be restored
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setAuthInitialized(true);
      if (currentUser) {
        getUsers(currentUser);
      } else {
        setError("User not authenticated");
        setIsDataloading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    // <div className="min-h-screen bg-gray-50">
    // </div>
    <div className=" ">
    {/* <h3 className="text-3xl font-semibold mb-10">All Users</h3> */}
    <h1 className="text-2xl font-bold mb-4">Users</h1>

    {error && <p className="text-red-500">{error}</p>}
    {/* List */}
    <Card>
        <CardContent>
            {/* Search Input */}
            <div className="mb-6 mt-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by email..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="pl-9 rounded-lg border-gray-400"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                <thead className="bg-muted/40 border-b border-gray-400">
  <tr className="text-muted-foreground font-semibold uppercase tracking-wide">
    <th className="px-3 py-2 text-left">Name</th>
    <th className="px-3 py-2 text-left">Email</th>
    <th className="px-3 py-2 text-left">Joined On</th>
    <th className="px-3 py-2 text-center">Actions</th>
  </tr>
</thead>
<tbody>
  {filteredUsers.map((s) => (
    <tr
      key={s.id}
      className="border-b border-gray-400 transition"
    >
      <td className="px-3 py-2 font-medium text-gray-700">
        {s.name || s.email?.split("@")[0]}
      </td>

      <td className="px-3 py-2 text-muted-foreground text-gray-700">
        {s.email}
      </td>

    

      <td className="px-3 py-2 text-gray-700">
        {fmt(s.createdAt)}
      </td>

      <td className="px-3 py-2 text-gray-700">
        <div className="flex justify-center gap-1">
          <button
            className="p-1 rounded hover:bg-blue-500/10"
            title="View"
          >
            <Eye className="w-3.5 h-3.5 text-blue-500" />
          </button>

          <button
            className="p-1 rounded hover:bg-red-500/10"
            title="Delete"
          >
            <svg
              className="w-3.5 h-3.5 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.8"
            >
              <path d="M4 7h16" />
              <path d="M10 11v6M14 11v6" />
              <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
              <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  ))}

  {isDataloading && !filteredUsers.length && (
    <tr>
      <td colSpan={5} className="py-10 text-center">
        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
      </td>
    </tr>
  )}
</tbody>

                </table>
            </div>

        </CardContent>

    </Card>

    {/* Delete Modal */}
    {/* <Modal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title={"Delete Plan"}
    >
        <div className="flex  ">
            <p className=" text-lg  font-medium ">Are you sure, you want to delete this? </p>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3 pt-5 ">
            <button
                onClick={() => {
                    setOpenDelete(false);
                    setSelectedId(null)
                }}
                className="rounded-md border border-slate-200 px-4 py-2.5 font-semibold text-md hover:bg-gray-800"
            >
                Cancel
            </button>
            <button
                onClick={handleDeletePlan}
                disabled={isDeleteloading}
                className="rounded-md  bg-primary px-4 py-2.5 text-md font-semibold text-primary-foreground   disabled:opacity-50"
            >
                {isDeleteloading ? "Deleting...." : "Yes, Sure"}
            </button>
        </div>
    </Modal> */}


</div >
  )
}

function fmt(ts) {
  if (!ts?.toDate) return "—";
  return ts.toDate().toDateString();
}


export default Users