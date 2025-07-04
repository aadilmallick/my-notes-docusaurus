# 15: Web Security

## Frontend Attacks

### XSRF attack

When an attacker takes advantages of the cookies set on a site you frequent to basically imitate a request as if it were coming from you. 

![](https://javascript.info/article/cookie/cookie-xsrf.svg)
Since this is very easy to exploit - you don't even need to know the user's cookies to do this, all you need to do is link to a site they go to - developers came up with the XSRF token to prevent this attack. 

#### Mitigation 1) XSRF token

On every site request, there is a unique one-time XSRF token that can't be forged. The server injects that token value into the site into some HTML elements, and all requests made to the server must also send that exact CSRF token for the user along with the request. 

#### Mitigation 2) samesite cookie

Using a cookie with the `samesite=strict` attribute set basically means that this cookie cannot be sent if a request was initiated from a site other than the domain this cookie was created from. 

Although protection is guaranteed by using this setting, the one downside is that if you follow a legitimate link this company sends you from an email, the cookies will not be sent and you won't be authenticated. 

To get around this, `samesite=lax` attribute was created that follows the behavior of `samesite=strict`, but will send cookies if both these conditions are true: 

1. HTTP method of link is GET and only GET (no writing data).
2. No navigation from an iframe. 


> [!NOTE] 
> By default in modern browsers, all cookies are `samesite="lax"`.




### Clickjacking Attack

A Clickjacking attack is where an evil site positions a transparent iframe of another site over a button that a user clicks on, whereby instead of clicking the button they click on the transparent iframe and initiate an action the attacker wants them to do. 

#### Mitigation

To mitigate against this, the server-sent HTML needs to send back with a response header `X-Frame-Options`, using one of these three values: 

- `DENY`: don't allow the page to be shown inside a frame
- `SAMEORIGIN`: allow the page to be shown inside a frame only if the page comes from the same origin. 
- `ALLOW-FROM <domain-name>`: allow the page to be shown inside a frame only if the page comes from the specified domain. 

## XSS

There are three types of XSS attacks: 

- **stored**: running JavaScript to save something or do something to the server's db.
- **reflected**: running JavaScript that executes client side and does something malicious
- **DOM**: injecting malicious JavaScript into form fields to do something bad. 
## CSP

CSP is a browser-enforced **allowlist** system that restricts which content sources (scripts, styles, images, etc.) can be loaded or executed. Its primary goal is to reduce risks from XSS and code injection.

CSP is like CORS except for assets like CSS, scripts, fonts, and images. Websites can specify content security policy rules for which domains and types of assets they want to allow for more granular control over which assets can be run and shown on their website. 

For example, code from `https://mybank.com` must have access to only `https://mybank.com`'s data, and `https://evil.example.com` must never be allowed access.

You can set up a CSP one of two ways: 

1. Server sends back a `Content-Security-Policy` header on every request. 
2. Frontend has a special `<meta>` tag defining the content security policy. 

Here's a table covering most of the directives you can specify:

|Directive|Purpose|
|---|---|
|`default-src`|Fallback source allowlist|
|`script-src`|Control JS sources and inline/script eval|
|`style-src`|Control CSS sources and inline styles|
|`img-src`|Control image origins|
|`connect-src`|Control XHR/WebSocket endpoints|
|`frame-ancestors`|Prevent embedding (clickjacking defense)|
|`report-uri/report-to`|Log CSP violations|
|`sandbox`|Restrictive policy for dynamic pages|
The syntax of a CSP is a semicolon separated list of directives, where each directive is the first element in a space-separated list of origins.

There is a special origin, `'self'`, which refers to the current origin (the host origin).

For example, the CSP below says that we trust any javascript coming from our own origin and the google APIs:

```
Content-Security-Policy: script-src 'self' https://apis.google.com
```


**headers method**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://apis.google.com;
  img-src 'self' https://images.example.com;
  style-src 'self' 'nonce-abc123';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  report-uri /csp-violation-endpoint;
```

**meta tag method**


```html
<meta http-equiv="Content-Security-Policy" 
	  content="script-src 'self' https://someotherdomain.com" 
/>
```

### Inline scripts

By default, CSP forbids any inline content or `eval()`. To allow an inline script you trust, you must use **nonces** or **hashes**:

```html
<script nonce="abc123">
  // Trusted inline function
</script>
```

And then in the meta tag or header, you must match that nonce in your allowlist

```
script-src 'self' 'nonce-abc123';
```