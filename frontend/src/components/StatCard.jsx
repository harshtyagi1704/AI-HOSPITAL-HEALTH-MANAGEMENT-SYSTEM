
function StatCard({
    title,
    value,
    color
}) {

    return (

        <div
            style={{
                background: color,
                color: "white",
                borderRadius: "15px",
                padding: "25px",
                minHeight: "120px",
                boxShadow: "0 8px 20px rgba(0,0,0,.12)"
            }}
        >

            <h3>{title}</h3>

            <h1>{value}</h1>

        </div>

    );

}

export default StatCard;