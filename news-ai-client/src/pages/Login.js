import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Container, Row, Col, Form, FormGroup, Label, Input,
  Button, Card, CardBody, CardHeader, Alert
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  // If already logged in, redirect to home page
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/'); // Redirect to home page after successful login
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <CardHeader>
              <h3 className="mb-0">Login</h3>
            </CardHeader>
            <CardBody>
              {error && <Alert color="danger">{error}</Alert>}
              {successMessage && <Alert color="success">{successMessage}</Alert>}

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormGroup>

                <Button
                  color="primary"
                  block
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p>
                  Don't have an account? <Link to="/register">Register</Link>
                </p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
