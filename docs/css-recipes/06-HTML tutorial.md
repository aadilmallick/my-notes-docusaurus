## Datalist 

The `<datalist>` element works a lot like a select except it has autocomplete.

```html
<div>Choose your favorite color:</div>
<input list="demo__list" />
<datalist id="demo__list">
    <option value="Blue" />
    <option value="Indigo" />
    <option value="Gray" />
    <option value="Green" />
    <option value="Pink" />
    <option value="Purple" />
    <option value="Red" />
    <option value="Yellow" />
</datalist>
```

## Dialog

The `dialog` element is used as an easy way to add a modal.

```html
<dialog open>
  <form method="dialog">
    <button type="submit" autofocus>close</button>
  </form>
</dialog>
```

Open a `<dialog>` element by setting the `open="true"` attribute on it. Once a dialog is open, there are three ways to close it: 

1. User submits a `<form>` with a `method="dialog"` attribute
2. User presses `esc` key
3. Use javascript to call the `dialog.close()` method, where the dialog element is an instance of the `HTMLDialogElement`.

**Dialog methods**

You have three methods available on the dialog in javascript.

```tsx
dialog.show() /* opens the dialog */
dialog.showModal() /* opens the dialog as a modal */
dialog.close() /* closes the dialog */
```

- `dialog.show()` : opens up the dialog, but without a darkened backdrop.
- `dialog.showModal()` : opens up the dialog with a darkened backdrop which you can style with the `::backdrop` pseudoelement.
- `dialog.close()` : closes the dialog