import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "buffalo_phase4_clean";
const FEMALE_TABS = ["Pedigree", "Reproduction", "Calving", "Health", "History"];
const FEMALE_CATEGORIES = ["Heifer", "Milk", "Dry"];

const EMPTY_FEMALE_DETAILS = {
  pedigree: { sire: "", dam: "" },
  reproduction: { notes: "" },
  calving: { notes: "" },
  health: { notes: "" },
  history: { notes: "" },
};

const EMPTY = {
  tag: "",
  sex: "Female",
  dob: "",
  status: "Active",
  exitDate: "",
  exitReason: "",
  femaleCategory: "Heifer",
  femaleDetails: EMPTY_FEMALE_DETAILS,
};

function loadAnimals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function withDefaults(animal) {
  if (animal.sex !== "Female") {
    return {
      ...animal,
      femaleCategory: "",
      femaleDetails: undefined,
    };
  }
  return {
    ...animal,
    femaleCategory: animal.femaleCategory || "Heifer",
    femaleDetails: {
      pedigree: {
        sire: animal.femaleDetails?.pedigree?.sire || "",
        dam: animal.femaleDetails?.pedigree?.dam || "",
      },
      reproduction: {
        notes: animal.femaleDetails?.reproduction?.notes || "",
      },
      calving: {
        notes: animal.femaleDetails?.calving?.notes || "",
      },
      health: {
        notes: animal.femaleDetails?.health?.notes || "",
      },
      history: {
        notes: animal.femaleDetails?.history?.notes || "",
      },
    },
  };
}

function normalizeAnimal(animal) {
  const next = withDefaults(animal);
  if (next.status === "Active") {
    next.exitDate = "";
    next.exitReason = "";
  }
  return next;
}

function isArchived(animal) {
  return animal.status === "Dead" || animal.status === "Culled";
}

export default function App(){
  const [animals,setAnimals]=useState(() => loadAnimals().map(withDefaults));
  const [form,setForm]=useState({ ...EMPTY });
  const [selectedId,setSelectedId]=useState(null);
  const [editing,setEditing]=useState(false);
  const [editForm,setEditForm]=useState({ ...EMPTY });
  const [msg,setMsg]=useState("");
  const [femaleTab, setFemaleTab] = useState("Pedigree");

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
    const nextAnimal = normalizeAnimal({id:Date.now(), ...form});
    setAnimals([...animals, nextAnimal]);
    setSelectedId(nextAnimal.id);
    setFemaleTab("Pedigree");
    setForm({ ...EMPTY });
    setMsg("Animal added.");
  }

  function openEdit(animal){
    setSelectedId(animal.id);
    setEditForm(normalizeAnimal({
      tag: animal.tag || "",
      sex: animal.sex || "Female",
      dob: animal.dob || "",
      status: animal.status || "Active",
      exitDate: animal.exitDate || "",
      exitReason: animal.exitReason || "",
      femaleCategory: animal.femaleCategory || "Heifer",
      femaleDetails: animal.femaleDetails || EMPTY_FEMALE_DETAILS,
      id: animal.id,
    }));
    setEditing(true);
    setMsg("");
  }

  function saveEdit(){
    if(!editForm.tag.trim()) {
      setMsg("Tag No is required.");
      return;
    }
    setAnimals(animals.map(a => a.id === selectedId ? normalizeAnimal({ ...a, ...editForm }) : a));
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
    setFemaleTab("Pedigree");
    setMsg("All browser data cleared.");
  }

  function updateSelectedFemaleDetails(section, key, value) {
    if (!selected || selected.sex !== "Female") return;
    const nextAnimals = animals.map(a => {
      if (a.id !== selected.id) return a;
      return normalizeAnimal({
        ...a,
        femaleDetails: {
          ...a.femaleDetails,
          [section]: {
            ...a.femaleDetails?.[section],
            [key]: value,
          },
        },
      });
    });
    setAnimals(nextAnimals);
  }

  function updateSelectedFemaleCategory(value) {
    if (!selected || selected.sex !== "Female") return;
    setAnimals(animals.map(a => a.id === selected.id ? normalizeAnimal({ ...a, femaleCategory: value }) : a));
  }

  return(
    <div className="container">
      <h1>Buffalo Herd App - Phase 4</h1>

      {msg && <div className="msg">{msg}</div>}

      <div className="grid">
        <div>
          <div className="card">
            <h3>Add Animal</h3>
            <label className="small">Tag No</label>
            <input
              value={form.tag}
              onChange={e=>setForm({...form,tag:e.target.value})}
            />

            <label className="small">Sex</label>
            <select
              value={form.sex}
              onChange={e=>setForm({...form,sex:e.target.value, femaleCategory: e.target.value === "Female" ? "Heifer" : "", femaleDetails: e.target.value === "Female" ? EMPTY_FEMALE_DETAILS : undefined})}
            >
              <option>Female</option>
              <option>Male</option>
            </select>

            {form.sex === "Female" && (
              <>
                <label className="small">Female Category</label>
                <select
                  value={form.femaleCategory}
                  onChange={e=>setForm({...form,femaleCategory:e.target.value})}
                >
                  {FEMALE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </>
            )}

            <label className="small">Date of Birth</label>
            <input
              placeholder="dd/mm/yyyy"
              value={form.dob}
              onChange={e=>setForm({...form,dob:e.target.value})}
            />

            <label className="small">Status</label>
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
                <label className="small">Exit Date</label>
                <input
                  placeholder="dd/mm/yyyy"
                  value={form.exitDate}
                  onChange={e=>setForm({...form,exitDate:e.target.value})}
                />
                <label className="small">Exit Reason</label>
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
              <button className="listbtn" key={a.id} onClick={() => {setSelectedId(a.id); setFemaleTab("Pedigree");}}>
                {a.tag} ({a.sex}){a.sex === "Female" ? ` - ${a.femaleCategory}` : ""} - {a.status}
              </button>
            ))}
          </div>

          <div className="card">
            <h3>Archive</h3>
            {archivedAnimals.length === 0 && <p>No archived animals.</p>}
            {archivedAnimals.map(a=>(
              <button className="listbtn" key={a.id} onClick={() => {setSelectedId(a.id); setFemaleTab("Pedigree");}}>
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
                {selected.sex === "Female" && (
                  <p><b>Female Category:</b> {selected.femaleCategory}</p>
                )}
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

          {selected && selected.sex === "Female" && (
            <div className="card">
              <h3>Female Workflow</h3>

              <label className="small">Current Female Category</label>
              <select
                value={selected.femaleCategory || "Heifer"}
                onChange={e => updateSelectedFemaleCategory(e.target.value)}
              >
                {FEMALE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>

              <div className="tabs">
                {FEMALE_TABS.map(tab => (
                  <button
                    key={tab}
                    className={`tabbtn ${femaleTab === tab ? "active" : ""}`}
                    onClick={() => setFemaleTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {femaleTab === "Pedigree" && (
                <>
                  <label className="small">Sire</label>
                  <input
                    value={selected.femaleDetails?.pedigree?.sire || ""}
                    onChange={e => updateSelectedFemaleDetails("pedigree", "sire", e.target.value)}
                  />
                  <label className="small">Dam</label>
                  <input
                    value={selected.femaleDetails?.pedigree?.dam || ""}
                    onChange={e => updateSelectedFemaleDetails("pedigree", "dam", e.target.value)}
                  />
                </>
              )}

              {femaleTab === "Reproduction" && (
                <>
                  <label className="small">Reproduction Notes</label>
                  <textarea
                    rows="5"
                    value={selected.femaleDetails?.reproduction?.notes || ""}
                    onChange={e => updateSelectedFemaleDetails("reproduction", "notes", e.target.value)}
                  />
                </>
              )}

              {femaleTab === "Calving" && (
                <>
                  <label className="small">Calving Notes</label>
                  <textarea
                    rows="5"
                    value={selected.femaleDetails?.calving?.notes || ""}
                    onChange={e => updateSelectedFemaleDetails("calving", "notes", e.target.value)}
                  />
                </>
              )}

              {femaleTab === "Health" && (
                <>
                  <label className="small">Health Notes</label>
                  <textarea
                    rows="5"
                    value={selected.femaleDetails?.health?.notes || ""}
                    onChange={e => updateSelectedFemaleDetails("health", "notes", e.target.value)}
                  />
                </>
              )}

              {femaleTab === "History" && (
                <>
                  <label className="small">History Notes</label>
                  <textarea
                    rows="5"
                    value={selected.femaleDetails?.history?.notes || ""}
                    onChange={e => updateSelectedFemaleDetails("history", "notes", e.target.value)}
                  />
                </>
              )}
            </div>
          )}

          {editing && (
            <div className="card">
              <h3>Edit Animal</h3>
              <label className="small">Tag No</label>
              <input
                value={editForm.tag}
                onChange={e=>setEditForm({...editForm,tag:e.target.value})}
              />

              <label className="small">Sex</label>
              <select
                value={editForm.sex}
                onChange={e=>setEditForm({...editForm,sex:e.target.value})}
              >
                <option>Female</option>
                <option>Male</option>
              </select>

              {editForm.sex === "Female" && (
                <>
                  <label className="small">Female Category</label>
                  <select
                    value={editForm.femaleCategory || "Heifer"}
                    onChange={e=>setEditForm({...editForm,femaleCategory:e.target.value})}
                  >
                    {FEMALE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </>
              )}

              <label className="small">Date of Birth</label>
              <input
                placeholder="dd/mm/yyyy"
                value={editForm.dob}
                onChange={e=>setEditForm({...editForm,dob:e.target.value})}
              />

              <label className="small">Status</label>
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
                  <label className="small">Exit Date</label>
                  <input
                    placeholder="dd/mm/yyyy"
                    value={editForm.exitDate}
                    onChange={e=>setEditForm({...editForm,exitDate:e.target.value})}
                  />
                  <label className="small">Exit Reason</label>
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
