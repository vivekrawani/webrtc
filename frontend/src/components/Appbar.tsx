import { useNavigate } from "react-router-dom";

function Appbar() {
    const navigate = useNavigate();
    return (
        <div className="bg-white w-full">
            <button
                onClick={() => { navigate('/sender') }}
            >Sender Page</button>
            <button onClick={() => navigate('/receiver')}>Receiver page</button>
        </div>
    )
}

export default Appbar;