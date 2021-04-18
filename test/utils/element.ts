import {act} from 'react-dom/test-utils';

type ElementProps = {
    dataId?: string;
    id?: string;
    name?: string;
    selector?: string;
};

export default class Element {
    private readonly _selector: string;

    private _element(): HTMLInputElement | HTMLButtonElement {
        return document.querySelector<HTMLInputElement | HTMLButtonElement>(
            this._selector
        );
    }

    constructor(props: ElementProps) {
        if (props.dataId) {
            this._selector = `[data-id=${props.dataId}]`;
        } else if (props.id) {
            this._selector = `#${props.dataId}`;
        } else if (props.name) {
            this._selector = `[name=${props.name}]`;
        } else {
            this._selector = props.selector;
        }
    }

    async blur() {
        await act(async () => {
            this._element().blur();
        });
    }

    async click() {
        await act(async () => {
            await this._element().click();
        });
    }

    async focus() {
        await act(async () => {
            await this._element().focus();
        });
    }

    getAttribute(attr: string) {
        if (['checked', 'disabled', 'readonly'].includes(attr)) {
            return !!this._element()[attr];
        }

        return this._element()[attr];
    }

    getValue() {
        return this._element().value;
    }

    innerText() {
        return (
            this._element().innerText || this._element().textContent
        ).trim();
    }

    isInDom() {
        return !!this._element();
    }

    async setValue(value: string, isMask?: boolean) {
        await this._element().focus();

        const set = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
        ).set;

        await act(async () => {
            set.call(
                this._element(),
                typeof value === 'string'
                    ? isMask
                        ? value.replace(/[/|\\|:|,|.|\s]/g, '')
                        : value
                    : value
            );
        });

        await this._element().blur();
    }

    async waitForEnabled() {
        await act(async () => {
            let isDisabled = this.getAttribute('disabled');

            while (isDisabled) {
                await new Promise((resolve) => setTimeout(resolve, 10));

                isDisabled = this.getAttribute('disabled');
            }
        });
    }

    async waitForInDom() {
        await act(async () => {
            let isInDom = !!this._element();

            while (!isInDom) {
                await new Promise((resolve) => setTimeout(resolve, 10));

                isInDom = !!this._element();
            }
        });
    }

    async waitForNotInDom() {
        await act(async () => {
            let isInDom = !!this._element();

            while (isInDom) {
                await new Promise((resolve) => setTimeout(resolve, 10));

                isInDom = !!this._element();
            }
        });
    }
}
