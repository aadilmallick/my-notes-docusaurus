## Basic HTTP file

```http
@baseUrl = http://127.0.0.1:54321/functions/v1
@supabaseAnonKey='YOUR_SUPABASE_ANON_KEY'

### Create payment session
POST {{baseUrl}}/create-payment
Content-Type: application/json
Authorization: Bearer {{supabaseAnonKey}}
apikey: {{supabaseAnonKey}}

{
  "email": "waadlingaadil@gmail.com",
  "customerName": "Aadil Mallick",
  "userId": "24e29886-45c8-4d55-8881-d327802363e6",
  "mealItems": [
    {
      "dishId": "meal_bbq_chicken",
      "name": "BBQ Chicken",
      "quantity": 2,
      "sides": ["White Rice", "Green Beans"]
    },
    {
      "dishId": "meal_salmon_bowl",
      "name": "Salmon Bowl",
      "quantity": 1,
      "sides": ["Quinoa"]
    }
  ],
  "mealTexture": "regular",
  "preferences": ["low_sodium", "high_protein"],
  "medical": ["diabetes"],
  "deliveryInfo": {
    "firstName": "Aadil",
    "lastName": "Mallick",
    "address": "123 Main St",
    "apartment": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105",
    "phone": "555-123-4567",
    "email": "waadlingaadil@gmail.com"
  }
}

### Create payment session (unauthenticated)
POST {{baseUrl}}/create-payment
Content-Type: application/json
Authorization: Bearer {{supabaseAnonKey}}
apikey: {{supabaseAnonKey}}

{
  "email": "waadlingaadil@gmail.com",
  "customerName": "Aadil Mallick",
  "mealItems": [
    {
      "dishId": "meal_bbq_chicken",
      "name": "BBQ Chicken",
      "quantity": 3,
      "sides": ["White Rice", "Green Beans", "Green Beans"]
    },
    {
      "dishId": "meal_salmon_bowl",
      "name": "Salmon Bowl",
      "quantity": 1,
      "sides": ["Quinoa"]
    }
  ],
  "mealTexture": "regular",
  "preferences": ["low_sodium", "high_protein"],
  "medical": ["diabetes"],
  "deliveryInfo": {
    "firstName": "Aadil",
    "lastName": "Mallick",
    "address": "123 Main St",
    "apartment": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105",
    "phone": "555-123-4567",
    "email": "waadlingaadil@gmail.com"
  }
}

### Create insurance request (unauthenticated)
POST {{baseUrl}}/create-insurance-request
Content-Type: application/json
Authorization: Bearer {{supabaseAnonKey}}
apikey: {{supabaseAnonKey}}

{
  "email": "jane.doe@example.com",
  "customerName": "Jane Doe",
  "mealItems": [
    {
      "dishId": "meal_turkey_meatballs",
      "name": "Turkey Meatballs",
      "quantity": 2,
      "sides": ["Brown Rice", "Broccoli"]
    },
    {
      "dishId": "meal_vegetable_pasta",
      "name": "Vegetable Pasta",
      "quantity": 1,
      "sides": ["Brown Rice"]
    }
  ],
  "mealTexture": "soft",
  "preferences": ["gluten_free"],
  "medical": ["hypertension"],
  "deliveryInfo": {
    "firstName": "Jane",
    "lastName": "Doe",
    "address": "123 Main St",
    "apartment": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105",
    "phone": "555-123-4567",
    "email": "jane.doe@example.com"
  },
  "insuranceProvider": "Blue Shield",
  "memberId": "BS-123456789",
  "groupNumber": "GRP-98765",
  "planName": "Gold PPO",
  "insuranceStatus": "pending"
}

### Create insurance request (authenticated)
POST {{baseUrl}}/create-insurance-request
Content-Type: application/json
Authorization: Bearer {{supabaseAnonKey}}
apikey: {{supabaseAnonKey}}

{
  "email": "waadlingaadil@gmail.com",
  "customerName": "Aadil Mallick",
  "userId": "24e29886-45c8-4d55-8881-d327802363e6",
  "mealItems": [
    {
      "dishId": "meal_turkey_meatballs",
      "name": "Turkey Meatballs",
      "quantity": 2,
      "sides": ["Brown Rice", "Broccoli"]
    },
    {
      "dishId": "meal_vegetable_pasta",
      "name": "Vegetable Pasta",
      "quantity": 1,
      "sides": ["Brown Rice"]
    }
  ],
  "mealTexture": "soft",
  "preferences": ["gluten_free"],
  "medical": ["hypertension"],
  "deliveryInfo": {
    "firstName": "Aadil",
    "lastName": "Mallick",
    "address": "123 Main St",
    "apartment": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105",
    "phone": "555-123-4567",
    "email": "waadlingaadil@gmail.com"
  },
  "insuranceProvider": "Blue Shield",
  "memberId": "BS-123456789",
  "groupNumber": "GRP-98765",
  "planName": "Gold PPO",
  "insuranceStatus": "pending"
}
```