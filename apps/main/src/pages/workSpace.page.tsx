import { Routes,Route } from "react-router-dom";
export const WorkSpacePage = () => {

    return <div>
        <aside>
            <Sidebar/>
        </aside>
        <main>
        <Routes>
            <Route path="" element={<div>Update</div>} />
            <Route path="create/profil" element={<div>Create</div>} />
            <Route path="delete" element={<div>Delete</div>} />
            <Route path="view" element={<div>View</div>} />
            <Route path="edit" element={<div>Edit</div>} />
            <Route path="delete" element={<div>Delete</div>} />
            <Route path="view" element={<div>View</div>} />
        </Routes>
        </main>
    </div>;
};
