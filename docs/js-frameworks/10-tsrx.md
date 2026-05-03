## TSRX

### Intro

TSRX is a language-agnostic way of writing JSX that compiles to React, Vue, or Svelte. It is very similar to JSX but allows you to write HTML and JS colocated in the same function without any weird stuff.

You define a tsrx component with the `component` keyword, which can only be used in `.tsrx` files.

```tsx
 component UserList({ users, showBio }: Props) {
   for (const user of users) {
     const initials = user.name.slice(0, 2).toUpperCase();
     const role = user.admin ? 'Admin' : 'Member';

     <div class="user-row">
       <span class="avatar">{initials}</span>
       <strong>{user.name}</strong>
       <span class="badge">{role}</span>

       if (showBio && user.bio) {
         const short_bio = user.bio.slice(0, 140);
         const report = () => console.log(`viewed ${user.name}`);

         <p class="bio">{short_bio}</p>
         <button onClick={report}>"Viewed"</button>
       }
     </div>
   }
 }
```

### Basic concepts

- **colocated styling**: In a component, any `<style>` tag you render is scoped to the component and immediately applies.
- **control flow**: You have standard control flow where you can conditionally render HTML.
- **string text**: To render text that is not a string variable, like just straight markup, you need to put that text in double quotes.

```tsx
export component FeatureCard({
  title,
  items,
  ready,
}: {
  title: string;
  items: string[];
  ready: boolean;
}) {
  <section class="feature-card">
    <h2>{title}</h2>

    if (ready) {
      <ul>
        for (const item of items; index index) {
          <li>{item}</li>
        }
      </ul>
    } else {
      <p>"Loading output..."</p>
    }
  </section>

  <style>
    .feature-card {
      padding: 1rem;
      border: 1px solid rgba(90, 108, 255, 0.2);
      background: rgba(255, 255, 255, 0.78);
    }

    .feature-card h2 {
      margin: 0 0 0.75rem;
      font-size: 1.15rem;
    }

    .feature-card ul {
      margin: 0;
      padding-left: 1.1rem;
    }
  </style>
}
```

## Ripple