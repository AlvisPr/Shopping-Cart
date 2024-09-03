// simulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];

//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("Fetched data:", result.data);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = () => {
  const [items, setItems] = React.useState(
    products.map(product => ({ ...product, stock: product.instock }))
  );
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Form,
  } = ReactBootstrap;
  const { useState } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );

  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.find((item) => item.name === name);
    if (item && item.stock > 0) {
      console.log("Adding to cart:", item);
      setCart([...cart, item]);
      setItems(items.map(i =>
        i.name === name ? { ...i, stock: i.stock - 1 } : i
      ));
    }
  };

  const deleteCartItem = (index) => {
    let itemToDelete = cart[index];
    console.log("Deleting from cart:", itemToDelete);
    let newCart = cart.filter((item, i) => index !== i);
    setCart(newCart);

    setItems(items.map(item =>
      item.name === itemToDelete.name
        ? { ...item, stock: item.stock + 1 }
        : item
    ));
  };

  const list = items.map((item, index) => {
    let imageUrl;
    switch (item.name.toLowerCase()) {
      case 'apples':
        imageUrl = 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80';
        break;
      case 'oranges':
        imageUrl = 'https://img.freepik.com/free-photo/orange-fruit_1203-6822.jpg?t=st=1725353547~exp=1725357147~hmac=b6b88abfc1bba2eed7c3b32381bc8eddcb0e23f1b76f8cf16dcdd53b6ba6cebc&w=900';
        break;
      case 'beans':
        imageUrl = 'https://img.freepik.com/free-photo/mountain-almonds_1203-908.jpg?t=st=1725353880~exp=1725357480~hmac=a25ed01bc01d0714b058d3b85ad3a4b5f3fcc31f17fed061d0d4f02f0916a3d3&w=1380';
        break;
      case 'cabbage':
        imageUrl = 'https://img.freepik.com/free-photo/organic-background-green-vegetarian-nutrition_1203-5845.jpg?t=st=1725353782~exp=1725357382~hmac=db9b8e4fb9fef2a1e087c207d3faa37ddd945e38cf0709b50ceeb8aaa420e7be&w=1380';
        break;
      default:
        imageUrl = `https://source.unsplash.com/300x300/?${item.name}`;
    }

    return (
      <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
        <Card>
          <Card.Img variant="top" src={imageUrl} style={{ height: '300px', objectFit: 'cover' }} />
          <Card.Body>
            <Card.Title className="font-weight-bold">{item.name}</Card.Title>
            <Card.Text className="text-muted">
              Price: <span className="text-primary font-weight-bold">${item.cost}</span> - Stock: <span className="text-success">{item.stock}</span>
            </Card.Text>
            <Button
              variant="primary"
              name={item.name}
              onClick={addToCart}
              disabled={item.stock === 0}
              className="w-100"
            >
              {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </Card.Body>
        </Card>
      </Col>
    );
  });

  const cartList = cart.map((item, index) => {
    return (
      <Card key={index} className="mb-2">
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index} className="text-decoration-none">
            <span className="font-weight-bold">{item.name}</span> - <span className="text-success">${item.cost}</span>
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse eventKey={1 + index}>
          <Card.Body>
            <p className="mb-2">Country: <span className="font-italic">{item.country}</span></p>
            <Button variant="outline-danger" size="sm" onClick={() => deleteCartItem(index)}>Remove</Button>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  const finalList = () => {
    let total = checkOut();
    console.log("Final total:", total);
    return { total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log("Checkout total:", newTotal);
    return newTotal;
  };

  const handleCheckout = () => {
    let total = checkOut();
    console.log("Handling checkout. Total:", total);
    setTotal(total);
    setCart([]);
  };

  const restockProducts = async (url) => {
    console.log("Restocking products from URL:", url);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched data:", data);
      
      let newItems = data.data.map((item) => {
        let { attributes } = item;
        return { 
          name: attributes.name, 
          country: attributes.country, 
          cost: attributes.cost, 
          instock: attributes.instock 
        };
      });

      setItems(prevItems => prevItems.map(existingItem => {
        const newItem = newItems.find(item => item.name === existingItem.name);
        return newItem ? { ...existingItem, stock: existingItem.stock + newItem.instock } : existingItem;
      }));

      console.log("Items after restocking:", items);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  
  return (
    <Container fluid className="vh-100 d-flex flex-column">
      <Row className="bg-primary text-white py-3 mb-4">
        <Col>
          <h1 className="text-center">React Shopping Cart</h1>
        </Col>
      </Row>
      <Row className="flex-grow-1 overflow-hidden">
        <Col md={8} className="h-100 overflow-auto">
          <h2 className="mb-4 text-primary">Product List</h2>
          <Row>{list}</Row>
        </Col>

        <Col md={4} className="h-100 d-flex flex-column">
          <h2 className="mb-4 text-primary">Cart Contents</h2>
          <div className="flex-grow-1 overflow-auto">
            <Accordion>{cartList}</Accordion>
          </div>

        </Col>
      </Row>

      <Row className="mt-4">
        <Col className="d-flex justify-content-between">
          <div className="col-md-5 "> 
            <h2 className="text-primary">Restock Products</h2>
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                restockProducts(query);
              }}
            >
              <Form.Group>
                <Form.Control
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Enter restock URL"
                  className="mb-2"
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">Restock Products</Button>
            </Form>
          </div>

          <div className="col-md-2 col-lg-4 "> 
            <Card className="bg-light h-100">
              <Card.Body className="d-flex flex-column justify-content-center">
                <Card.Title className="text-success font-weight-bold mb-3">Total: ${finalList().total}</Card.Title>
                <Button variant="success" onClick={handleCheckout}>Checkout</Button>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

ReactDOM.render(<Products />, document.getElementById("root"));