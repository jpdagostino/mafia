import React, { isValidElement } from "react";
import { ReactElement } from "react";
import Anchor from "../menu/Anchor";
import translate from "../game/lang";
import { Button, ButtonProps } from "./Button";
import Icon from "./Icon";

type CopyButtonResult = boolean;
type CopyButtonProps = ButtonProps<CopyButtonResult> & { onClick?: undefined, ref?: undefined, text: string };

function reconcileCopyProps(props: CopyButtonProps): ButtonProps<CopyButtonResult> {
    let newProps: Partial<CopyButtonProps> = {...props};
    delete newProps.onClick;
    delete newProps.ref;
    newProps.text = undefined;
    delete newProps.text;

    return newProps;
}

export function CopyButton(props: CopyButtonProps): ReactElement {
    let pressedChildren = props.pressedChildren;
    const children = props.children ?? <Icon>content_copy</Icon>;
    if (pressedChildren === undefined && isValidElement(children) && children.type === Icon) {
        pressedChildren = success => success ? <Icon>done</Icon> : <Icon>warning</Icon>;
    }

    return <Button {...reconcileCopyProps(props)} 
        onClick={() => writeToClipboard(props.text)}
        pressedText={success => translate("notification.clipboard.write." + (success ? "success" : "failure"))}
        pressedChildren={pressedChildren}
    >
        {children ?? <Icon>content_copy</Icon>}
    </Button>
}

type PasteButtonResult<H> = "success" | "clipboardError" | H;
type PasteButtonProps<H> = ButtonProps<PasteButtonResult<H>> & { 
    onClick?: undefined, 
    onClipboardRead?: (text: string) => (void | "success" | H)
    pressedText?: never,
    failureText?: (result: H) => React.ReactNode
};

function reconcilePasteProps<H>(props: PasteButtonProps<H>): ButtonProps<PasteButtonResult<H>> {
    const newProps: Partial<PasteButtonProps<H>> = {...props};
    delete newProps.onClick;
    delete newProps.onClipboardRead;
    delete newProps.failureText;

    return newProps;
}

export function PasteButton<H>(props: PasteButtonProps<H>): ReactElement {
    let pressedChildren = props.pressedChildren;
    const children = props.children ?? <Icon>paste</Icon>;
    if (pressedChildren === undefined && isValidElement(children) && children.type === Icon) {
        pressedChildren = success => success === "success" ? <Icon>done</Icon> : <Icon>warning</Icon>;
    }
    
    return <Button {...reconcilePasteProps(props)}
        onClick={() => readFromClipboard().then(text => {
            if (text === null) return "clipboardError";
            if (props.onClipboardRead === undefined) return "success";

            return props.onClipboardRead(text) ?? "success";
        })}
        pressedText={result => {
            if (result === "success" || (typeof result === "boolean" && result)) {
                return translate("notification.clipboard.read.success")
            }
            if (result === "clipboardError") {
                return translate("notification.clipboard.read.failure")
            }
            if (props.failureText === undefined) {
                return translate("notification.clipboard.handleRead.failure")
            }
            return props.failureText(result)
        }}
        pressedChildren={pressedChildren}
    >
        {children}
    </Button>
}

/**
 * Note: This function pushes an error card if it is unsuccessful
 * @returns Whether the clipboard was successfully written to.
 */
async function writeToClipboard(text: string): Promise<boolean> {
    if (!navigator.clipboard) {
        Anchor.pushError(
            translate("notification.clipboard.write.failure"), 
            translate("notification.clipboard.write.failure.noClipboard")
        );
        return false;
    }

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        Anchor.pushError(
            translate("notification.clipboard.read.failure"), 
            translate("notification.clipboard.read.failure.notAllowed")
        );
        return false;
    }
}

/**
 * Note: This function pushes an error card if it is unsuccessful
 * @returns The string read from the clipboard, and null on any kind of failure.
 */
async function readFromClipboard(): Promise<string | null> {
    if (!navigator.clipboard) {
        Anchor.pushError(
            translate("notification.clipboard.read.failure"), 
            translate("notification.clipboard.read.failure.noClipboard")
        );
        return null;
    }

    try {
        const text = await navigator.clipboard.readText();
        return text;
    } catch (error) {
        switch ((error as any as DOMException).name) {
            case "NotFoundError":
                Anchor.pushError(
                    translate("notification.clipboard.read.failure"), 
                    translate("notification.clipboard.read.failure.notFound")
                );
                return null;
            case "NotAllowedError":
            default:
                Anchor.pushError(
                    translate("notification.clipboard.read.failure"), 
                    translate("notification.clipboard.read.failure.notAllowed")
                );
                return null;
        }
    }
}