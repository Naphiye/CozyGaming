import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";

export class mouseInputHandler {
    isHovering = false;
    private canvas: HTMLCanvasElement;
    private onClickRestart: () => void;


    constructor(canvas: HTMLCanvasElement,
        onClickRestart: () => void) {
        this.canvas = canvas;
        this.onClickRestart = onClickRestart;
    }

	public bind() {
		this.canvas.addEventListener("click", this.handleClick);
        this.canvas.addEventListener("mousemove", this.handleHover);
	}

    private handleClick = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (this.isInRestartButton(x, y)) {
            this.onClickRestart();
        }
    };

    private handleHover = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.isHovering = this.isInRestartButton(x, y);
    };

    private isInRestartButton(x: number, y: number) {
        const w = 200, h = 60;
        const bx = CANVAS_WIDTH / 2 - w / 2;
        const by = CANVAS_HEIGHT / 2 + 60;
        return x >= bx && x <= bx + w && y >= by && y <= by + h;
    }

    unbind() {
        this.canvas.removeEventListener("click", this.handleClick);
        this.canvas.removeEventListener("mousemove", this.handleHover);
    }
}
