import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "buffalo_phase3_clean";

const EMPTY = {
  tag: "",
  sex: "Female",
  dob: "",
  status: "Active",
  exitDate: "",
  exitReason: "",
};

function loadAnimals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function isArchived(animal) {
  return animal.status === "Dead" || animal.status === "Culled";
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

  const currentAnimals = animals.filter(a => !isArchived(a));
  const archivedAnimals = animals.filter(a => isArchived(a));

  function addAnimal(){
    if(!form.tag.trim()) {
      setMsg("Tag No is required.");
      return;
    }
    const nextAnimal = {id:Date.now(), ...form};
    setAnimals([...animals, nextAnimal]);
    setSelectedId(nextAnimal.id);
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
      exitDate: animal.exitDate || "",
      exitReason: animal.exitReason || "",
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

  function deleteAnimal() {
    if (!selected) return;
    const ok = window.confirm(`Delete animal ${selected.tag}?`);
    if (!ok) return;
    setAnimals(animals.filter(a => a.id !== selected.id));
    setSelectedId(null);
    setEditing(false);
    setMsg("Animal deleted.");
  }

  function clearData() {
    const ok = window.confirm("Clear all browser-saved data?");
    if (!ok) return;
    setAnimals([]);
    setSelectedId(null);
    setEditing(false);
    setForm({ ...EMPTY });
    setEditForm({ ...EMPTY });
    setMsg("All browser data cleared.");
  }

  return(
    <div className="container">
      <h1>Buffalo Herd App - Phase 3</h1>

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

            {(form.status === "Dead" || form.status === "Culled") && (
              <>
                <label>Exit Date</label>
                <input
                  placeholder="dd/mm/yyyy"
                  value={form.exitDate}
                  onChange={e=>setForm({...form,exitDate:e.target.value})}
                />
                <label>Exit Reason</label>
                <input
                  value={form.exitReason}
                  onChange={e=>setForm({...form,exitReason:e.target.value})}
                />
              </>
            )}

            <button onClick={addAnimal}>Add Animal</button>
            <button className="danger" onClick={clearData}>Clear Browser Data</button>
          </div>

          <div className="card">
            <h3>Current Herd</h3>
            {currentAnimals.length === 0 && <p>No current animals.</p>}
            {currentAnimals.map(a=>(
              <button className="listbtn" key={a.id} onClick={()=>setSelectedId(a.id)}>
                {a.tag} ({a.sex}) - {a.status}
              </button>
            ))}
          </div>

          <div className="card">
            <h3>Archive</h3>
            {archivedAnimals.length === 0 && <p>No archived animals.</p>}
            {archivedAnimals.map(a=>(
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
                {(selected.status === "Dead" || selected.status === "Culled") && (
                  <>
                    <p><b>Exit Date:</b> {selected.exitDate || "-"}</p>
                    <p><b>Exit Reason:</b> {selected.exitReason || "-"}</p>
                  </>
                )}
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

              {(editForm.status === "Dead" || editForm.status === "Culled") && (
                <>
                  <label>Exit Date</label>
                  <input
                    placeholder="dd/mm/yyyy"
                    value={editForm.exitDate}
                    onChange={e=>setEditForm({...editForm,exitDate:e.target.value})}
                  />
                  <label>Exit Reason</label>
                  <input
                    value={editForm.exitReason}
                    onChange={e=>setEditForm({...editForm,exitReason:e.target.value})}
                  />
                </>
              )}

              <button onClick={saveEdit}>Save Changes</button>
              <button className="danger" onClick={deleteAnimal}>Delete Animal</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
