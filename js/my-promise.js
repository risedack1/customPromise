const FULFILLED = 'fulfilled';
const PENDING = 'pending';
const REJECTED = 'rejected';


class customPromise {
    constructor(fn) {
        this.state = PENDING;
        this.result = undefined;
        this.onFulfilledArr = [];
        this.onRejectedArr = [];

        const resolve = (value) => {
            if (this.state === PENDING) {
                this.state = FULFILLED;
                this.result = value;
                this.onFulfilledArr.forEach((func) => {
                    func(value);
                });
            }
        };

        const reject = (error) => {
            if (this.state === PENDING) {
                this.state = REJECTED;
                this.result = error;
                this.onRejectedArr.forEach((func) => {
                    func(error);
                });
            }
        };

        try {
            fn(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    then(onFulfilled, onRejected) {
        return new customPromise((resolve, reject) => {
            if (this.state === PENDING) {
                if (onFulfilled) {
                    this.onFulfilledArr.push(() => {
                        try {
                            const newResult = onFulfilled(this.result);

                            if (newResult instanceof customPromise) {
                                newResult.then(resolve, reject);
                            } else {
                                resolve(newResult);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    });
                }

                if (onRejected) {
                    this.onRejectedArr.push(() => {
                        try {
                            const newRejected = onRejected(this.result);

                            if (newRejected instanceof customPromise) {
                                newRejected.then(resolve, reject);
                            } else {
                                reject(newRejected);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    });
                }
            }

            if (onFulfilled && this.state === FULFILLED) {
                try {
                    const newResult = onFulfilled(this.result);

                    if (newResult instanceof customPromise) {
                        newResult.then(resolve, reject);
                    } else {
                        resolve(newResult);
                    }
                } catch (error) {
                    reject(error);
                }

                return;
            }

            if (onRejected && this.state === REJECTED) {
                try {
                    const newRejected = onRejected(this.result);
                    if (newRejected instanceof customPromise) {
                        newRejected.then(resolve, reject);
                    } else {
                        reject(newRejected);
                    }
                } catch (error) {
                    reject(error);
                }

                return;
            }
        });
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }
}

// Ex 1
const promise = new customPromise((resolve, reject) => {
    resolve('success');
});

console.log('Ex 1: ', promise);

// Ex 2

const promise2 = new customPromise((resolve, reject) => {
    setTimeout(() => resolve('success'), 1000);
});

console.log('Ex 2: ', promise2);

// Ex 3 (call just one time)

const promise3 = new customPromise((resolve, reject) => {
    setTimeout(() => reject('error'), 100);
    setTimeout(() => resolve('success 3'), 200);
    resolve('success');
});

setTimeout(() => {
    console.log('Ex 3: ', promise3);
}, 400);

// Ex 4 (then method)

const promise4 = new customPromise((resolve, reject) => {
    setTimeout(() => resolve('success'), 2000);
}).then((value) => {
    console.log('Ex 4: ', value);
});

// Ex 5 (then method with Error)

const promise5 = new customPromise((resolve, reject) => {
    setTimeout(() => reject('error'), 2000);
}).then((value) => {
    console.log('Ex 5: ', value);
}, (error) => {
    console.log('Ex 5: ', error);
});

// Ex 6 (catch method)

const promise6 = new customPromise((resolve, reject) => {
    setTimeout(() => reject('error'), 3000);
}).catch((error) => {
    console.log('Ex 6: ', error);
});

// Ex 7 (then chaining)

const promise7 = new customPromise((resolve, reject) => {
    setTimeout(() => resolve('success'), 4000);
}).then((value) => {
    return value + ' first then';
}).then((value) => {
    return value + ' secon then';
}).then((value) => {
    console.log('Ex 7: ', value);
});

// Ex 8 (call new promise from then)

const promise8 = new customPromise((resolve, reject) => {
    setTimeout(() => resolve('success'), 5000);
}).then(value => {
    return new customPromise((resolve, reject) => {
        value = value + ' 1';
        resolve(value);
    });
}).then(value => {
    console.log('Ex 8: ', value);
});