const cell = (props, context) => {
    function getCellColor(value) {
        const colors = {
            2: "bg-yellow-100 text-black",
            4: "bg-yellow-200 text-black",
            8: "bg-yellow-300 text-black",
            16: "bg-yellow-400",
            32: "bg-yellow-500",
            64: "bg-yellow-600",
            128: "bg-yellow-700",
            256: "bg-yellow-800",
            512: "bg-yellow-900",
            1024: "bg-orange-500",
            2048: "bg-orange-600",
        };
        return colors[value] || "bg-gray-200";
    }

    return {
        div:{
            id: props.id,
            class: () => `w-16 h-16 ${getCellColor(props.value)} flex items-center justify-center text-2xl font-bold rounded tile`,
            text: props.value || "",
        }
    }
};
export default cell;