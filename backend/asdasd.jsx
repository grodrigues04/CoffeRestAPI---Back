import styles from "../assets/styles/cafes.module.css";
import { useEffect, useState } from "react";

function Cafes() {
    const [cafes, setCafes] = useState([])
    useEffect(()=>{
        const fetchData = async () =>{
            const response = await fetch("http://localhost:8000")
            .then((res)=>{
                return res.json();
            })
            .then((data)=>{
                console.log(data)
                setCafes(data)
            })
            .catch((error)=>{
                setCafes(error)
            })
        }

        fetchData()
    }, [])

    // function requestDelet(id){
    //     const response = fetch(`http://localhost:8000/cafe/${id}`)
    //     .then((res) =>{
    //         res.json()
    //     })
    // }
    return (
        <article className={styles.table_section}>
            <h2 className={styles.table_title}>Lista de Cafés</h2>
            <table className={styles.coffee_table}>
                <thead>
                    <tr>
                        <th>Nome do Café</th>
                        <th>Preço</th>
                        <th>Marca</th>
                        <th>Ano de vencimento</th>
                        <th>Caminho da Imagem</th>
                        <th>Editar</th>
                    </tr>
                </thead>
                <tbody>
                {cafes.map((cafe)=>(
                    <tr key={cafe.id}>
                        <td>{cafe.nome_cafe}</td>
                        <td>R${cafe.preco}</td>
                        <td>{cafe.marca}</td>
                        <td>{cafe.ano_vencimento}</td>
                        <td>{cafe.img}</td>
                        <td>
                            <button className={styles.edit_button}>Editar</button>
                            <button className={styles.delete_button} onClick={()=>requestDelet(cafe.id)}>Excluir</button>
                        </td>   
                    </tr>
                ))}
                </tbody>
            </table>
        </article>
    );
}

export default Cafes;