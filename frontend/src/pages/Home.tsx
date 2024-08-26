import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    return (
        <div>
            <button
                onClick={() => { navigate('/sender') }}
            >Sender Page</button>
            <button onClick={() => navigate('/receiver')}>Receiver page</button>
        </div>
    )
}

export default Home;