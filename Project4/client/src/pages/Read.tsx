import { useParams } from "react-router-dom";

export default function Read() {
    const { id } = useParams();
    return <main>Read: {id}</main>;
}
