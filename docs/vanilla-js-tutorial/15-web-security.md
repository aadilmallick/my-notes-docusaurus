# 15: Web Security

## Frontend Attacks

### XSRF attack

When an attacker takes advantages of the cookies set on a site you frequent to basically imitate a request as if it were coming from you. 

![](https://javascript.info/article/cookie/cookie-xsrf.svg)
Since this is very easy to exploit - you don't even need to know the user's cookies to do this, all you need to do is link to a site they go to - developers came up with the XSRF token to prevent this attack. 

#### Mitigation 1) XSRF token

On every site request, there is a unique one-time XSRF token that can't be forged. You can use that

#### Mitigation 2) samesite cookie

Using a cookie with the `samesite=strict` attribute set basically means that this cookie cannot be sent if a request was initiated from a site other than the domain this cookie was created from. 

Although protection is guaranteed by using this setting, the one downside is that if you follow a legitimate link this company sends you from an email, the cookies will not be sent and you won't be authenticated. 

To get around this, `samesite=lax` attribute was created that follows the behavior of `samesite=strict`, but will send cookies if both these conditions are true: 

1. HTTP method of link is GET and only GET (no writing data).
2. No navigation from an iframe. 

### Clickjacking Attack

A Clickjacking attack is where an evil site positions a transparent iframe of another site over a button that a user clicks on, whereby instead of clicking the button they click on the transparent iframe and initiate an action the attacker wants them to do. 

#### Mitigation

To mitigate against this, the server-sent HTML needs to send back with a response header `X-Frame-Options`, using one of these three values: 

- `DENY`: don't allow the page to be shown inside a frame
- `SAMEORIGIN`: allow the page to be shown inside a frame only if the page comes from the same origin. 
- `ALLOW-FROM <domain-name>`: allow the page to be shown inside a frame only if the page comes from the specified domain. 