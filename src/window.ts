import fs from 'fs';
import path from 'path';

declare global {
    interface Window {
        WINDOW_HEIGHT: number;
        WINDOW_WIDTH: number;
    }
}

window.WINDOW_HEIGHT = 1070;
window.WINDOW_WIDTH = 1070;

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: 28
});

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: 150
});

Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: window.WINDOW_HEIGHT
});

Object.defineProperty(document.documentElement, 'scrollWidth', {
    configurable: true,
    value: window.WINDOW_WIDTH
});

Object.defineProperty(window.document.documentElement, 'clientWidth', {
    configurable: true,
    value: window.WINDOW_WIDTH
});

Object.defineProperty(window.document.documentElement, 'clientHeight', {
    configurable: true,
    value: window.WINDOW_HEIGHT
});

Object.defineProperty(window.document.body, 'clientWidth', {
    configurable: true,
    value: window.WINDOW_WIDTH
});

Object.defineProperty(window.document.body, 'clientHeight', {
    configurable: true,
    value: window.WINDOW_HEIGHT
});

Object.defineProperty(window, 'innerWidth', {
    writable: true,
    value: window.WINDOW_WIDTH
});

Object.defineProperty(window, 'innerHeight', {
    writable: true,
    value: window.WINDOW_HEIGHT
});

Object.defineProperty(window, 'outerWidth', {
    writable: true,
    value: window.WINDOW_WIDTH
});

Object.defineProperty(window, 'outerHeight', {
    writable: true,
    value: window.WINDOW_HEIGHT + 79
});

document.body.style.height = `${window.WINDOW_HEIGHT}px`;
document.body.style.width = `${window.WINDOW_WIDTH}px`;

if (!document.hasOwnProperty('createRange')) {
    document.createRange = () => ({
        setStart: () => {
        },
        setEnd: () => {
        },
        //@ts-ignore
        commonAncestorContainer: {
            nodeName: 'BODY',
            ownerDocument: document
        }
    });
}

Object.defineProperty(window.Element.prototype, 'innerText', {
    set(value) {
        this.textContent = value;
    },
    configurable: true
});

window.navigator.msSaveBlob = (blob: any, fileName: string) => {

    fs.writeFileSync(
        `${path.resolve(process.cwd(), './tmp')}/${fileName}`,
        blob
    );

    return true;
};

window.navigator.msSaveOrOpenBlob = (blob: any, fileName: string) => {

    fs.writeFileSync(
        path.normalize(path.join(`${path.resolve(process.cwd(), './tmp')}`,fileName)),
        blob
    );

    return true;
};

HTMLElement.prototype.getBoundingClientRect = () => {
    return {
        x: 0,
        y: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: window.WINDOW_WIDTH / 4,
        height: window.WINDOW_HEIGHT / 4,
        toJSON(): any {
            return '';
        }
    };
};
