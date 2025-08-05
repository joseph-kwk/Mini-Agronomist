# Python Backend Setup Guide

## Quick Setup

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Python API Server
```bash
# From the backend directory
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Verify Backend is Running
Visit: `http://localhost:8001/docs` for interactive API documentation

## Integration with Frontend

The frontend automatically detects and connects to the Python backend when available.

### Dual Mode Operation
- **Frontend Only**: Pyodide (Python in browser) for offline scientific computing
- **Full Stack**: JavaScript frontend + Python FastAPI backend for maximum performance

### API Endpoints

#### Core Computations
- `POST /compute/gdd` - Growing Degree Days calculation
- `POST /compute/water-balance` - Soil water balance analysis
- `POST /compute/climate-risk` - Climate risk assessment

#### Machine Learning
- `POST /ml/train` - Train yield prediction models
- `POST /ml/predict` - Make yield predictions
- `GET /models` - List available models

#### Comprehensive Analysis
- `POST /predict/comprehensive` - Full agricultural analysis

## Development Workflow

1. **Start both servers**:
   ```bash
   # Terminal 1: Frontend
   python -m http.server 8000
   
   # Terminal 2: Backend
   cd backend && python main.py
   ```

2. **Access application**: `http://localhost:8000`
3. **API docs**: `http://localhost:8001/docs`

## Features Enabled by Python Backend

### Advanced Scientific Computing
- Precise Growing Degree Day calculations
- Penman-Monteith evapotranspiration
- Statistical analysis using SciPy
- Machine learning with Scikit-learn

### Performance Benefits
- Server-side processing for complex calculations
- Model persistence and reuse
- Batch processing capabilities
- Real-time API responses

### Scalability
- Handle multiple concurrent users
- Database integration ready
- Cloud deployment ready
- Microservices architecture

## Production Deployment

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Environment Variables
```bash
# .env file
API_HOST=0.0.0.0
API_PORT=8001
LOG_LEVEL=info
DATABASE_URL=postgresql://user:pass@localhost/db
```

### Cloud Deployment Options
- **Heroku**: Ready for deployment
- **AWS Lambda**: Serverless deployment
- **Google Cloud Run**: Container deployment
- **Azure Functions**: Serverless option

## Testing

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest tests/
```

## Architecture Benefits

### Why Python Backend?

1. **Scientific Computing Power**
   - NumPy, SciPy, Pandas ecosystem
   - Advanced statistical models
   - Machine learning libraries

2. **Agricultural Expertise**
   - Specialized agricultural equations
   - Climate modeling capabilities
   - Crop growth simulations

3. **Performance & Scalability**
   - Efficient numerical computations
   - Model caching and reuse
   - Database integration

4. **Future Extensions**
   - Weather API integration
   - Satellite data processing
   - IoT sensor data analysis
   - Real-time crop monitoring

This hybrid architecture gives you the best of both worlds: offline PWA functionality with optional server-side power!
