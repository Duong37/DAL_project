# Decentralized Active Learning (DAL) Framework

A framework for implementing decentralized active learning systems with blockchain integration.

## 🎯 Overview

DAL is a full-stack framework that combines:
- Active Learning for efficient data labeling
- Blockchain for decentralized coordination
- FastAPI backend for robust API services
- React frontend for interactive labeling

### Key Features

1. **Active Learning Engine**
   - Integration with modAL library
   - Support for custom query strategies
   - Performance tracking and metrics
   - Model versioning

2. **Blockchain Integration**
   - Model state versioning
   - Decentralized consensus
   - Transaction tracking
   - Data integrity verification

3. **FastAPI Backend**
   - RESTful API endpoints
   - Async support
   - OpenAPI documentation
   - Type safety with Pydantic

4. **React Frontend**
   - Modern Material-UI interface
   - Real-time updates
   - Interactive labeling
   - Progress monitoring

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- pip and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/DAL_project.git
cd DAL_project
```

2. Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd DAL/frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
uvicorn DAL.backend.main:app --reload
```

2. Start the frontend development server:
```bash
cd DAL/frontend
npm start
```

3. Run the example script:
```bash
python examples/run_prototype.py
```

## 📁 Project Structure

```
DAL/                              # Full-stack framework
├── backend/                      # FastAPI backend
│   ├── __init__.py              # Package initialization
│   ├── main.py                  # FastAPI application
│   ├── al_manager.py            # Active Learning logic
│   ├── blockchain_adapter.py     # Blockchain integration
│   ├── data_manager.py          # Data management
│   ├── routes/                  # API endpoints
│   │   └── al_routes.py
│   ├── utils.py                 # Utility functions
│   └── schemas.py               # Pydantic models
│
├── frontend/                     # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
│
└── __init__.py

models/                          # Model definitions
└── base_model.py                # Base model class

examples/                        # Example scripts
└── run_prototype.py             # Demo script

data/                           # Demo datasets
└── dataset.csv
```

## 🔧 Configuration

### Backend Configuration

The backend can be configured through environment variables or a config file:

```python
# config.py
SETTINGS = {
    'MODEL_PATH': 'models/',
    'DATA_PATH': 'data/',
    'BATCH_SIZE': 5,
    'MAX_ITERATIONS': 100
}
```

### Frontend Configuration

Frontend settings can be modified in `.env`:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_BATCH_SIZE=5
```

## 🔌 API Endpoints

### Active Learning Endpoints

- `POST /api/v1/al/initialize`
  - Initialize the active learning model
  - Requires initial labeled dataset

- `POST /api/v1/al/query`
  - Query for most informative samples
  - Returns indices and uncertainty scores

- `POST /api/v1/al/update`
  - Update model with new labels
  - Returns performance metrics

- `GET /api/v1/al/status`
  - Get current system status
  - Returns training progress and metrics

## 💻 Development

### Adding New Features

1. Create a new branch:
```bash
git checkout -b feature/your-feature
```

2. Implement your changes
3. Add tests
4. Submit a pull request

### Running Tests

```bash
# Backend tests
pytest DAL/backend/tests/

# Frontend tests
cd DAL/frontend
npm test
```

## 📚 Documentation

- API Documentation: http://localhost:8000/docs
- Frontend Documentation: http://localhost:3000/docs
- Example Notebooks: `/notebooks`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- modAL team for the active learning library
- FastAPI team for the amazing framework
- React and Material-UI teams
