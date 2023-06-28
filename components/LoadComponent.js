import { Loading } from "web3uikit"

export default function LoadComponent() {
    return (
        <div
            style={{
                backgroundColor: "#ECECFE",
                borderRadius: "8px",
                padding: "25px",
            }}
        >
            <Loading
                fontSize={12}
                size={12}
                spinnerColor="#2E7DAF"
                spinnerType="wave"
                text="Loading..."
            />
        </div>
    )
}
