## Stripe Payment Links

## Stripe Checkout Sessions

Stripe checkout sessions are ways to dynamically build checkout carts for a customer by building a server and sending product information about the products in the cart to stripe. Stripe then redirects the user to its own payment page to pay for the products.

### Stripe config

The first thing to do is to initialize a stripe instance like so, using the secret api key from the stripe dashboard.

```ts
import { Stripe } from "npm:stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

### Products in stripe

Products in stripe can be created manually in the stripe dashboard or dynamically. Here are the use cases for both:

- **manual creation**: Best used for product or subscription that is fixed, i.e., selling a fixed digital product or service like online colab coding notebook.
- **dynamic creation**: Best used for products or subscriptions with add-ons and customizations that are best suited for creating a product at runtime.

When creating a product manually, the most important things to note are its **price id** and **product id**, which help you get information about the product during the checkout or during webhooks.

- **price id**: contains information about the purchase, like tax info, price point, etc.
- **product**: contains information about the product, like name, description, images, and any metadata you set on the product itself from the stripe dashboard.

![product dashbaord](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1744379718/image-clipboard-assets/upcwpopkfhapitfhsw6s.webp)

You can easily fetch products and prices through the stripe SDK:

```ts
  async function getProductById(productId: string) {
    return await stripe.products.retrieve(productId);
  }

  async function getPriceById(priceId: string) {
    return await stripe.prices.retrieve(priceId);
  }
```

### Checkout with products

The `stripe.checkout.sessions.create()` method redirects the client side to the stripe checkout page to buy a subscription or one-time product. Here are the options you can pass in to configure the checkout experience:

- `payment_method_types`: A `string[]` value of the different types of payment options to make available in the checkout page.
- `mode`: `"payment"` for one-time payments and `"subscription"` if buying a subscription.
- `cancel_url`: the URL of your server to redirect to if the user cancels the payment.
- `success_url`: the URL of your server to redirect to if the user successfully goes through with the payment.
- `metadata`: an object of type `Record<string, string>` that allows you to pass data through and retrieve it with webhooks. This is useful for passing data like who initiated the purchase and any other stuff.

The most important option here is `line_items`, which is an array of the different products to buy in the checkout cart. There are three different ways to register products for a checkout cart here:

1. Register via `priceId` of a product
2. Register via the product id to the `price_data.product` key
3. Dynamically create a new product with the `price_data.product_data` key

```ts
async function checkout() {
  const response = await this.stripe.checkout.sessions.create({
	payment_method_types: ["card", "cashapp", "link"],
	mode: "payment", // for one-time payment
	cancel_url: "http://localhost:8000/checkout/cancel",
	success_url: "http://localhost:8000/checkout/success",
	line_items: [
		// example of registering product from price id
		{
			priceId: "price_1RCEhz4h8gpbjBP8iYDV1X8L", 
			quantity: 1
		},
		// example of registering product from product id
		{
	      quantity: this.quantity,
	      price_data: {
	        product: this.productId,
	        currency: "usd",
	      },
	    },
		// example of registering product dynamically
		{
	      quantity: this.quantity,
	      price_data: {
	        currency: "usd",
	        product_data: {
	          name: "Buggati",
	          images: ["https://...."],
	          description: "Super fancy car",
	          metadata: {
		          payload: JSON.stringify({ 
			          instructionsLink: "https://..." 
		          })
	          },
	        },
	        // Stripe requires the amount in cents
	        unit_amount: this.priceInDollars * 100, 
	      },
	    }
	],
	// any metadata to pass so you can access in webhooks
	metadata: {
		payload: JSON.stringify({ userId: "waadlingaadil@gmail.com" })
	},
  });

  const checkoutPageUrl = response.url;
}
```

Once you await the checkout session you will get back a response, with the most important thing being the unique stripe checkout page url located on `response.url`. This is the page we want to redirect our users to. 

In summary, here is the flow: 

1. From the frontend, when the user is ready to purchase, make a request to our server at some arbitrary route like `/stripe/checkout`, and await the response.
2. In that route, create a checkout session with the `stripe.checkout.sessions.create()` method and get back the checkout page URL and return it to the frontend.
3. After getting back the response, manually navigate from the frontend to that checkout page link.

```ts
async function submitCart() {
  const response = await fetch("/stripe/checkout", {
	method: "POST"
  });
  const data = await response.json();
  window.location.href = data.redirectUrl as string;
}
```

### Checkout with subscriptions

## Stripe Webhooks

### Stripe CLI

The Stripe CLI is an easy way to test out webhooks locally.

The first step to use the stripe CLI is to run the `stripe login` command.

1. Run `stripe login` to login to stripe
2. Run `stripe listen` command like so, specifying which events you want to register the webhook for, and to which origin and route the webhook should request:

```bash
stripe listen -e checkout.session.completed --forward-to http://localhost:3000/webhook
```

3. After successfully listening, copy the outputted webhook secret into your `.env` and use it for testing your webhooks.

### Stripe webhooks

After setting up listeners for webhooks with the stripe CLI, you can move on to registering your route handler for the webhook:

1. Create a webhook event with the `stripe.webhooks.constructEventAsync()` method, combining three things to create a unique webhook handshake with stripe
	- 1) The request body as plain text
	- 2) The `Stripe-Signature` request header value
	- 3) The webhook secret stripe gave you from the CLI or from production.
2. Do different actions based on the webhook event type.
3. Send back a 200 response to let stripe know you handled the webhook without any problems.

```ts
app.post("/stripe/webhook", async (req) => {
    const sig = req.headers.get("Stripe-Signature")!;
    const rawBody = await req.text();
    
	if (!this.stripeOptions.webhookSecret) {
		throw new Error("Webhook secret is not set");
	}
    if (!sig) {
	    throw new Error("Stripe signature header is not set");
    }

    const webhookEvent = await this.stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

	switch (webhookEvent.type) {
	      case "checkout.session.completed": 
		      // when the user successfully checksout
		      // you can access their email, address, and product details
		      break;
	}

	// required to send back a 200 response if everything goes well
	return app.json({}, 200)
})
```

## Custom Stripe Class

```ts
import { Stripe } from "npm:stripe";
import { ServerURLManager } from "../utils/ServerUrlManager.ts";

interface EnvManager {
  validateKeys(): void;
  [key: string]: string | (() => void);
  STRIPE_PUBLISHABLE_KEY: string;
}

const envManager: EnvManager = {
  STRIPE_SECRET_KEY: Deno.env.get("STRIPE_SECRET_KEY")!,
  validateKeys() {
    for (const key in this) {
      if (this[key] === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
      }
    }
  },
};

export const stripe = new Stripe(envManager.STRIPE_SECRET_KEY);

abstract class Product {
  abstract quantity: number;
  abstract getLineItem(): Stripe.Checkout.SessionCreateParams.LineItem;
  abstract serialize(): Record<string, any>;
}

export function manageMetadata<T extends Record<string, any>>() {
  return {
    extractMetadataFromSession: (session: Stripe.Checkout.Session) => {
      if (!session.metadata || !session.metadata?.payload) return null;

      return JSON.parse(session.metadata.payload) as T;
    },
    getMetadata: (metadata: T) => {
      return {
        payload: JSON.stringify(metadata),
      };
    },
  };
}

export class ProductWithPriceId extends Product {
  constructor(public priceId: string, public quantity: number) {
    super();
  }

  override getLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
    return {
      quantity: this.quantity,
      price: this.priceId,
    };
  }

  override serialize() {
    return this.getLineItem();
  }
}

export class ProductWithProductId extends Product {
  constructor(public productId: string, public quantity: number) {
    super();
  }

  override getLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
    return {
      quantity: this.quantity,
      price_data: {
        product: this.productId,
        currency: "usd",
      },
    };
  }

  override serialize() {
    return this.getLineItem();
  }
}

export class DynamicProduct extends Product {
  constructor(
    public quantity: number,
    public priceInDollars: number,
    public productOptions: {
      productName: string;
      imageUrls?: string[];
      description?: string;
      payloadData?: Record<string, string>;
    }
  ) {
    super();
  }

  override getLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
    return {
      quantity: this.quantity,
      price_data: {
        currency: "usd",
        product_data: {
          name: this.productOptions.productName,
          images: this.productOptions.imageUrls || [],
          description: this.productOptions.description || "",
          metadata: this.productOptions.payloadData || {},
        },
        unit_amount: this.priceInDollars * 100, // Stripe requires the amount in cents
      },
    };
  }

  override serialize(): Record<string, any> {
    return this.getLineItem();
  }
}

class StripeManager {
  constructor(
    public stripe: Stripe,
    private stripeOptions: {
      successCallbackUrl: string;
      cancelCallbackUrl: string;
      webhookUrl?: string;
      webhookSecret?: string;
    }
  ) {}

  async createPaymentSession(
    products: Product[],
    metadata?: Record<string, any>
  ) {
    try {
      const response = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card", "cashapp", "link"],
        mode: "payment", // for one-time payment
        cancel_url: this.stripeOptions.cancelCallbackUrl,
        success_url: this.stripeOptions.successCallbackUrl,
        line_items: [...products.map((product) => product.getLineItem())],
        metadata,
      });
      const checkoutPageUrl = response.url;
      return checkoutPageUrl;
    } catch (e) {
      console.error("Error creating Stripe session:", e);
      return null;
    }
  }

  async getProductById(productId: string) {
    return await this.stripe.products.retrieve(productId);
  }

  async getPriceById(priceId: string) {
    return await this.stripe.prices.retrieve(priceId);
  }

  async onWebhookCall(
    req: Request,
    cbs: {
      // when the checkout session is completed for subscription or one time payment
      onCheckoutSessionCompleted?: (
        session: Stripe.Checkout.Session
      ) => Promise<void>;
      // when the user cancels the ckeckout session, you can grab their email and spam them
      onCheckoutSessionExpired?: (
        session: Stripe.Checkout.Session
      ) => Promise<void>;
      onSubscriptionUpdated?: (
        subscription: Stripe.Subscription
      ) => Promise<void>;
      // when the subscription is deleted, you need to modify the record in the database to remove premium features
      onSubscriptionDeleted?: (
        subscription: Stripe.Subscription
      ) => Promise<void>;
      // when the user's credit card is revoked and unable to pay, either rmeove their subscription or mark it to be revoked in the future
      onInvoicePaymentFailed?: (invoice: Stripe.Invoice) => Promise<void>;
      // when the invoice is paid, you can mark the user as premium again
      onInvoicePaid?: (invoice: Stripe.Invoice) => Promise<void>;
    }
  ) {
    if (!this.stripeOptions.webhookSecret)
      throw new Error("Webhook secret is not set");
    const rawBody = await req.text();
    const sig = req.headers.get("Stripe-Signature")!;
    if (!sig) throw new Error("Stripe signature header is not set");

    const webhookEvent = await this.stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      this.stripeOptions.webhookSecret!
    );

    switch (webhookEvent.type) {
      case "checkout.session.completed": {
        const session = await stripe.checkout.sessions.retrieve(
          webhookEvent.data.object.id,
          {
            expand: ["line_items"],
          }
        );
        await cbs.onCheckoutSessionCompleted?.(session);
        break;
      }
      case "checkout.session.expired": {
        const session = await stripe.checkout.sessions.retrieve(
          webhookEvent.data.object.id,
          {
            expand: ["line_items"],
          }
        );
        await cbs.onCheckoutSessionExpired?.(session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = await stripe.subscriptions.retrieve(
          webhookEvent.data.object.id
        );
        await cbs.onSubscriptionUpdated?.(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = await stripe.subscriptions.retrieve(
          webhookEvent.data.object.id
        );
        await cbs.onSubscriptionDeleted?.(subscription);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = await stripe.invoices.retrieve(
          webhookEvent.data.object.id!
        );
        await cbs.onInvoicePaymentFailed?.(invoice);
        break;
      }
      case "invoice.paid": {
        const invoice = await stripe.invoices.retrieve(
          webhookEvent.data.object.id!
        );
        await cbs.onInvoicePaid?.(invoice);
        break;
      }
    }
  }
}

```