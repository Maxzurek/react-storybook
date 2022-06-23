const testFunction = () => {
    const array = Array(99999999).fill().map((_, i) => i + 1);
    array.map(number => number);
    array.reduce((x, y) => {
        return x + y;
    });
};


self.onmessage = async (event) => {
    const data = event.data;
    console.log(data);

    testFunction();

    self.postMessage("Work's done!");
};