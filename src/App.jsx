import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "buffalo_phase2_clean";

const EMPTY = {
  tag: "",
  sex: "Female",
  dob: "",
  status: "Active",
};

function loadAnimals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App(){
  const [animals,setAnimals]=useState(() => loadAnimals());
  const [form,setForm]=useState({ ...EMPTY });
  const [selectedId,setSelectedId]=useState(null);
  const [editing,setEditing]=useState(false);
  const [editForm,setEditForm]=useState({ ...EMPTY });
  const [msg,setMsg]=useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
  }, [animals]);

  const selected = useMemo(
    () => animals.find(a => a.id === selectedId) || null,
    [animals, selectedId]
  );

  function addAnimal(){
    if(!form.tag.trim()) {
      setMsg("Tag No is required.");
      return;
    }
    const next = [...animals, {id:Date.now(), ...form}];
    setAnimals(next);
    setSelectedId(next[next.length - 1].id);
    setForm({ ...EMPTY });
    setMsg("Animal added.");
  }

  function openEdit(animal){
    setSelectedId(animal.id);
    setEditForm({
      tag: animal.tag || "",
      sex: animal.sex || "Female",
      dob: animal.dob || "",
      status: animal.status || "Active",
    });
    setEditing(true);
    setMsg("");
  }

  function saveEdit(){
    if(!editForm.tag.trim()) {
      setMsg("Tag No is required.");
      return;
    }
    setAnimals(animals.map(a => a.id === selectedId ? { ...a, ...editForm } : a));
    setEditing(false);
    setMsg("Animal updated.");
  }

  return(
    <div className="container">
      <h1>Buffalo Herd App - Phase 2</h1>

      {msg && <div className="msg">{msg}</div>}

      <div className="grid">
        <div>
          <div className="card">
            <h3>Add Animal</h3>
            <label>Tag No</label>
            <input
              value={form.tag}
              onChange={e=>setForm({...form,tag:e.target.value})}
            />

            <label>Sex</label>
            <select
              value={form.sex}
              onChange={e=>setForm({...form,sex:e.target.value})}
            >
              <option>Female</option>
              <option>Male</option>
            </select>

            <label>Date of Birth</label>
            <input
              placeholder="dd/mm/yyyy"
              value={form.dob}
              onChange={e=>setForm({...form,dob:e.target.value})}
            />

            <label>Status</label>
            <select
              value={form.status}
              onChange={e=>setForm({...form,status:e.target.value})}
            >
              <option>Active</option>
              <option>Dead</option>
              <option>Culled</option>
            </select>

            <button onClick={addAnimal}>Add Animal</button>
          </div>

          <div className="card">
            <h3>Herd</h3>
            {animals.length === 0 && <p>No animals yet.</p>}
            {animals.map(a=>(
              <button className="listbtn" key={a.id} onClick={()=>setSelectedId(a.id)}>
                {a.tag} ({a.sex}) - {a.status}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Selected Animal</h3>
            {!selected && <p>No animal selected.</p>}
            {selected && (
              <>
                <p><b>Tag:</b> {selected.tag}</p>
                <p><b>Sex:</b> {selected.sex}</p>
                <p><b>DOB:</b> {selected.dob || "-"}</p>
                <p><b>Status:</b> {selected.status || "Active"}</p>
                <button onClick={() => openEdit(selected)}>Edit Animal</button>
              </>
            )}
          </div>

          {editing && (
            <div className="card">
              <h3>Edit Animal</h3>
              <label>Tag No</label>
              <input
                value={editForm.tag}
                onChange={e=>setEditForm({...editForm,tag:e.target.value})}
              />

              <label>Sex</label>
              <select
                value={editForm.sex}
                onChange={e=>setEditForm({...editForm,sex:e.target.value})}
              >
                <option>Female</option>
                <option>Male</option>
              </select>

              <label>Date of Birth</label>
              <input
                placeholder="dd/mm/yyyy"
                value={editForm.dob}
                onChange={e=>setEditForm({...editForm,dob:e.target.value})}
              />

              <label>Status</label>
              <select
                value={editForm.status}
                onChange={e=>setEditForm({...editForm,status:e.target.value})}
              >
                <option>Active</option>
                <option>Dead</option>
                <option>Culled</option>
              </select>

              <button onClick={saveEdit}>Save Changes</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
