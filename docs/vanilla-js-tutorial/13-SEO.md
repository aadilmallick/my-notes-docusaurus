## HTML DOM SEO

### Images

The most SEO related things for images is just related to performance since they are the biggest resource sink on a webpage. But also alt attributes are important. 

#### Alt

You should never omit the `alt=` attribute, but it depends what you need to put for the alt description depending on the image you are describing.

-  **Normal image**: Imagine you are going to be describing the image to a screen-reader that is blind. H
	- Example:  `alt="Fluffy, a tri-color terrier with very short hair, with a tennis ball in her mouth"`
- **ICONS:** For icons, a simple one word description describing the intention of the icon is sufficient.
	- Example: a search icon should have `alt="search"`
- **Decorative:** If the image is purely **decorative,** include an empty `alt=""` and `role="none"`

#### Preventing layout shifts

```html
<img src="switch.svg" alt="light switch" role="img" width="70" height="112" />
```

Specifying both `width` and `height` on an image improves performance because it prevents layout shifts.

CSS will override these values, but you can provide a correct aspect ratio for the image to prevent layout shifts anyway.