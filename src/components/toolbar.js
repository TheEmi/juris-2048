const toolbar = (props, context) => {
    const { getState, setState } = context;
  return {
    div: {
        class: "flex justify-between items-center p-4 bg-gray-800 text-white rounded-lg mb-4",
        children: [
            {
                div: {
                    text: "Juris 2048",
                    class: "text-2xl font-bold"
                }
            },
            {
                div: {
                    text: ()=> getState("score",0),
                }
            },
            {
                button: {
                    class: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
                    text: "Undo",
                    onclick: () => {
                        const prevCells = getState("prevCells", null);
                        if (prevCells) {
                            setState("cells", prevCells);
                            setState("prevCells", null);
                            setState("score", getState("prevScore",0));
                        }
                    }
                }
            },
        ]
    }
    }
}
export default toolbar;