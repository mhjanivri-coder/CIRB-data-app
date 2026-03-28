import { useState } from "react";

export default function App(){
  const [animals,setAnimals]=useState([]);
  const [tag,setTag]=useState("");
  const [sex,setSex]=useState("Female");
  const [selected,setSelected]=useState(null);

  function addAnimal(){
    if(!tag) return;
    setAnimals([...animals,{id:Date.now(),tag,sex}]);
    setTag("");
  }

  return(
    <div className="container">
      <h1>Buffalo Herd App - Phase 1</h1>

      <div className="card">
        <h3>Add Animal</h3>
        <input placeholder="Tag No"
          value={tag}
          onChange={e=>setTag(e.target.value)} />

        <select value={sex}
          onChange={e=>setSex(e.target.value)}>
          <option>Female</option>
          <option>Male</option>
        </select>

        <button onClick={addAnimal}>Add Animal</button>
      </div>

      <div className="card">
        <h3>Herd</h3>
        {animals.map(a=>(
          <div key={a.id}>
            <button onClick={()=>setSelected(a)}>
              {a.tag} ({a.sex})
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="card">
          <h3>Selected Animal</h3>
          <p>Tag: {selected.tag}</p>
          <p>Sex: {selected.sex}</p>
        </div>
      )}
    </div>
  )
}
