# 14 Accessibility

## Intro

There are three things you need to make a website accessible:

1. All content must be accessible via the keyboard
2. You should make sure navigating using the keyboard takes as few keystrokes as possible
3. Make sure content is easy to read for the screen reader

**Why make things accessible?**

Just like how adding ramps to curbs not only benefitted disabled people, but also normal people, making things accessible often benefits normal people as well by making it easier to use. You simply make a better product.

**three levels of accessibility**

There is A, AA, and AAA, where AAA is the gold standard of letting disabled people access 100% of the website’s content and functionality.

## Alt Text

Alt text is what screen readers use to describe an image to a blind person. If no alt text is included, the screen reader will simply read the filename of the image, which is bound to be horrendous for UX.

For purely decorative images, have empty alt text like `alt=""` which signals to the screen reader to skip over this image.

> [!WARNING] 
> Alt text for images shouldn’t say something like “an image of ...” because the user already knows it's an image. 


Here are the properties alt text should have:
1. clear and concise
2. Should have a period at the end to give a pause to screen readers

Here is an example of some good alt text: “rubber duck in batman costume.”

## Links

### Link text

When linking on text, you should not have the link text be something like “click here” or “here”. 
Good link text is unambiguous, lets the user know exactly what they’re clicking on.

Here is an example:

| Good | What are you waiting for? [Visit Scrimba here](https://www.notion.so/Accessibility-c52224a6eae14220b8562c7ff460ee00?pvs=21) |
| ---- | --------------------------------------------------------------------------------------------------------------------------- |
| Bad  | What are you waiting for? Visit Scrimba [here](https://www.notion.so/Accessibility-c52224a6eae14220b8562c7ff460ee00?pvs=21) |

### Card Links

When wanting a card to be a clickable link element, you need something more than just wrapping the entire card in an `<a>` tag. Here is what that’ll look like:

```html
<!-- card container -->
<div class="astronaut-section card">

	<!-- card content -->
	<p>Inspired by creative minds like Hideo Kojima, 
	the artist offers a collection of otherwordly art 
	that makes us contemplate about our place in the cosmos, 
	where we are heading, 
	and if the glow cloud of Night Vale is friend or foe.☁ 
	<b class="cta">Check out more of their awesome art by clicking this card.
	</b></p>
	<img class="image image-1" src="images/astronaut.jpg" />
	
	<!-- link for card: empty text -->
	<a href="<https://unsplash.com/@shaarannnnn>" target="_blank"
	 aria-label="Check out more of this artist's otherwordly art"></a>
</div>
```

As you can see, inside the card container we have a link element that should have empty text, have absolute styling that covers entire card, and have `aria-label=`. Let’s dive into that:

1. Empty nested link text.
2. Put `aria-label=` attribute on the `<a>` that acts as a substitute for the link text.
3. Use block display, z-index, and absolute positioning to make link cover entire card and be what the user clicks on when they click on the card.

### Nav Links

When you have a gorup of nav links in a nav bar, the accessible and semantic way to do it is to group all the nav links inside an `<ul>` tag and represent the links nested inside `<li>` tags.

```html
<footer class="footer">
  <ul class="social-links">
      <li><a class="social-link" href="#">
          <ion-icon class="icon" name="logo-facebook"></ion-icon>
          <p>Facebook</p>
      </a><li>
      <li><a class="social-link" href="#">
          <ion-icon class="icon" name="logo-instagram"></ion-icon>
          <p>Instagram</p>
      </a><li>
      <li><a class="social-link" href="#">
          <ion-icon class="icon" name="logo-linkedin"></ion-icon>
          <p>LinkedIn</p>
      </a><li>
      <li><a class="social-link" href="#">
          <ion-icon class="icon" name="logo-twitter"></ion-icon>
          <p>Twitter</p>
      </a><li>
  </ul>
</footer>
```
## Aria

### Basics

Aria is what allows us to make non-semantic elements like `<div>` elements more accessible to users. We use aria attributes to accomplish this: 

You can use three attributes for labelling with aria.

- `aria-label` : the label for an element. Set this to a string
- `aria-labeledby` : If you don’t want to inline a long label into your html, you can use the labeled by property to refer to the id of an element whose text content contains that description
- `aria-describedby` : same thing as labeling by, but as a description, which is less essential than a label. It’s a “more info” kind of thing.

> [!NOTE]
>When you don’t want to inline your labels and descriptions, you can use the `aria-labeledby=` and `aria-describedby=` attributes to refer to elements containing that description as text. You can then visually hide those elements.

You also have these basic attributes you can set:

 - `role=` : this attribute specifies what the element is acting as.
 - `tabindex="0"` : makes the element tabbable and focusable. This is useful for custom elements or if you are setting this on a scrollable container. 
 - `tabindex="-1"` : prevents the element from being tabbable but allows the element to be focusable programmatically. You should not use any other values for `tabindex` except for 0 and -1. 

### Focusing on elements

To style custom elements when they are being focused, you need to have some sort of visual indicator that an element currently has focus. For this, use the `:focus-visible` pseudoselector.

```css
button:focus-visible {
	outline: 1px solid black;
}
```

### Making accessible button

Here are all the things you would need to do to turn a `<div>` into mocking the interactive behavior of a button and making it accessible:

1. Give `role="button"` to let screen readers know that this element is able to be interacted with.
2. Set `tabindex="0"` to make the element tabbable
3. Give the element a good focus styling.
4. Listen for a keyboard press on the **enter** key with the `keyup` event and set that to the same functionality in the `onClick` event, to mimic how you can click a button pressing enter.
5. Set an `aria-label` to describe what will happen

### Making accessible switch

Here is an example of how we create a dark mode toggle to be accessible:

```html
<button id="toggleTheme" onclick="toggleTheme()" role="switch" 
aria-checked="false">Light Mode</button>
```

- `role=` : this attribute specifies what the element is acting as. Right now `role="switch"` specifies that the element acts as a switch.
- `tabindex="0"` : makes the element focusable
- `aria-checked=` : adds accessible state to the switch. If the switch is turned on, set equal to “true”, else to “false”.

### aria-live

When showing things like popups or toast notifications, you should add an `aria-live` attribute to that element to let the user know that a disappearing time-sensitive element has appeared on the screen.

- `aria-live="polite"`: low priority notification
- `aria-live="assertive"`: high priority notification, interrupts user. This is not good UX, so save this for extremely important occasions.
## Color Contrast

TO get triple A level contrast, go to this site and check your colors against each other.

[WebAIM: Contrast Checker](https://webaim.org/resources/contrastchecker/)

Contrast ratio is noted as **foreground:background** , which means the same color will have a ratio of 1:1, which is the absolute worst. The highest contrast ratio is black:white, which is 21:1.

- AA standard is 4.5:1
- AAA standard is 7.0:

Aim for AAA standard. 

## Skip Link

To make a skip link, don’t hide it. Instead translate it off screen so that it’s still visible to screen readers.

```css
.skip-link {
	transform: translate(-2000px);
	transition: 3s transform
	position:absolute;
	z-index: 1000;
}

.skip-link:focus {
	transform: translate(0px);
}
```