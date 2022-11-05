const areObjectEqualShallow = (object1: object, object2: object) => {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (!keys1.length && !keys2.length) {
        return true;
    }

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key in object1) {
        const keyAsIndex = key as keyof typeof object1;
        if (object1[keyAsIndex] !== object2[keyAsIndex]) {
            return false;
        }
    }
    return true;
};

export { areObjectEqualShallow };
