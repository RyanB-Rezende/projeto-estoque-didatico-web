import { getUsuario } from "../services/usuarioService";

const usuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        getUsuario().then(setUsuarios);
    }, []);

    return (
        <ul>
            {usuarioList.map((u) => (
                <li key={u.id}>
                    <strong>{u.nome}</strong> - {u.email} - {u.telefone}
                </li>
            ))}
            </ul>
    );
};

export default usuarioList;

// import { getUsuario } from "../services/usuarioService";