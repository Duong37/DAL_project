# DAL (Decentralized Active Learning) System

A modular microservices-based Active Learning system with blockchain integration for decentralized model training and consensus.

## Architecture

The DAL system is built using a 3-service microservices architecture:

### 1. **AL Engine Service** (Port 8001)
- **Purpose**: Core Active Learning logic with pluggable architecture
- **Features**: 
  - Multiple AL framework support (modAL, ALiPy, custom implementations)
  - Plugin system for models, query strategies, and datasets
  - Configuration-driven component selection
  - Performance tracking and metrics

### 2. **Blockchain Service** (Port 8002)
- **Purpose**: Decentralized consensus and immutable record keeping
- **Features**:
  - Transaction storage and retrieval
  - Voting mechanisms
  - Model update history
  - Chain validation

### 3. **DAL Orchestrator Service** (Port 8000)
- **Purpose**: API gateway and experiment coordination
- **Features**:
  - Unified API for frontend applications
  - Experiment lifecycle management
  - Service coordination and health monitoring
  - Cross-service communication

## Quick Start

### Prerequisites
- Python 3.8+
- pip
- Virtual environment (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DAL_project
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies for each service**
   ```bash
   # AL Engine
   cd al-engine
   pip install -r requirements.txt
   cd ..
   
   # Blockchain Service
   cd blockchain-service
   pip install -r requirements.txt
   cd ..
   
   # DAL Orchestrator
   cd dal-server
   pip install -r requirements.txt
   cd ..
   ```

### Running the System

#### Option 1: Use the startup script (Recommended)
```bash
python start_microservices.py
```

#### Option 2: Start services manually
```bash
# Terminal 1 - AL Engine
cd al-engine
python main.py

# Terminal 2 - Blockchain Service
cd blockchain-service
python main.py

# Terminal 3 - DAL Orchestrator
cd dal-server
python main.py
```

### Verify Installation
```bash
# Check system status
curl http://localhost:8000/system/status

# Run the workflow test
python test_microservices_workflow.py
```

## API Documentation

Once the services are running, you can access the interactive API documentation:

- **DAL Orchestrator**: http://localhost:8000/docs
- **AL Engine**: http://localhost:8001/docs  
- **Blockchain Service**: http://localhost:8002/docs

## Example Workflow

### 1. Initialize an Experiment
```bash
curl -X POST http://localhost:8000/experiments/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "experiment_id": "my_experiment",
    "al_framework": {"type": "sklearn"},
    "model": {
      "type": "random_forest",
      "parameters": {"n_estimators": 50, "random_state": 42}
    },
    "query_strategy": {"type": "uncertainty_sampling"},
    "dataset": {"type": "wine", "synthetic_samples": 50}
  }'
```

### 2. Get Next Sample for Labeling
```bash
curl http://localhost:8000/experiments/my_experiment/next-sample
```

### 3. Submit a Label
```bash
curl -X POST http://localhost:8000/experiments/my_experiment/submit-label \
  -H "Content-Type: application/json" \
  -d '{
    "sample_id": "sample_22",
    "label": 2,
    "confidence": 0.9
  }'
```

### 4. Get Experiment Metrics
```bash
curl http://localhost:8000/experiments/my_experiment/metrics
```

## Configuration

### AL Engine Plugins

The AL Engine supports a plugin architecture for extensibility:

- **Frameworks**: `al-engine/plugins/frameworks/`
- **Models**: `al-engine/plugins/models/`
- **Query Strategies**: `al-engine/plugins/strategies/`
- **Datasets**: `al-engine/plugins/datasets/`

### Available Plugins

Currently implemented:
- **Framework**: Scikit-learn (with optional modAL integration)
- **Models**: Random Forest, SVM, Logistic Regression
- **Query Strategies**: Uncertainty Sampling, Random Sampling
- **Datasets**: Wine, Iris, Synthetic

## System Features

### Implemented Features

- **Microservices Architecture**: Clean separation of concerns
- **Plugin System**: Extensible AL components
- **Blockchain Integration**: Immutable experiment records
- **Health Monitoring**: Service status and metrics
- **API Gateway**: Unified interface for clients
- **Experiment Management**: Full lifecycle support
- **Performance Tracking**: Comprehensive metrics
- **Error Handling**: Robust error management
- **Documentation**: OpenAPI/Swagger docs

### Active Learning Workflow

1. **Initialization**: Load dataset, configure model and strategy
2. **Query**: Select most informative unlabeled samples
3. **Label**: Human annotator provides labels
4. **Update**: Retrain model with new labeled data
5. **Evaluate**: Track performance metrics
6. **Repeat**: Continue until stopping criteria met

### Blockchain Features

- **Transaction Storage**: All model updates recorded
- **Consensus Mechanism**: Voting on model updates
- **Immutable History**: Complete audit trail
- **Chain Validation**: Integrity verification

## JupyterLab Extension Integration

### Modern API Integration

The JupyterLab extension has been **updated to use the modern microservices API** for optimal performance and maintainability. The extension now uses clean, RESTful endpoints that align with the microservices architecture.

### Modern API Endpoints Used:

The JupyterLab extension now uses the modern `/experiments/*` and `/system/*` endpoints:

- `POST /experiments/initialize` - Initialize new AL experiments
- `GET /experiments/{id}/status` - Get experiment status and metrics
- `GET /experiments/{id}/next-sample` - Get next sample for labeling
- `POST /experiments/{id}/submit-label` - Submit labels and update model
- `GET /experiments/{id}/metrics` - Get performance metrics
- `GET /experiments/{id}/model-updates` - Get model update history
- `GET /system/status` - Get overall system status
- `POST /system/reset` - Reset the entire system
- `GET /blockchain/status` - Get blockchain status
- `GET /blockchain/blocks` - Get recent blockchain blocks

### Using the Updated JupyterLab Extension:

1. **Start the microservices:**
   ```bash
   python start_microservices.py
   ```

2. **Build and install the updated extension:**
   ```bash
   cd jupyterlab-dal-extension
   npm install
   npm run build
   jupyter labextension install .
   jupyter lab
   ```

3. **Open the DAL panel in JupyterLab:**
   - Use the command palette: `Ctrl+Shift+C` → "Open DAL Panel"
   - Or use the DAL menu item

4. **Test the modern API:**
   ```bash
   python test_modern_api_workflow.py
   ```

### Key Improvements:

- **Clean Architecture**: No legacy compatibility layer - pure microservices API
- **Better Performance**: Direct communication with optimized endpoints
- **Enhanced Features**: Access to full experiment lifecycle management
- **Future-Proof**: Built on modern, extensible API design

## Extending the System

### Adding New AL Frameworks

1. Create a new plugin in `al-engine/plugins/frameworks/`
2. Implement the `ALFrameworkPlugin` interface
3. Register the plugin in the registry

### Adding New Models

1. Create a new plugin in `al-engine/plugins/models/`
2. Implement the `ModelPlugin` interface
3. Add configuration support

### Adding New Query Strategies

1. Create a new plugin in `al-engine/plugins/strategies/`
2. Implement the `QueryStrategyPlugin` interface
3. Define strategy parameters

## Monitoring and Debugging

### Health Checks
```bash
# System overview
curl http://localhost:8000/system/status

# Individual services
curl http://localhost:8001/health  # AL Engine
curl http://localhost:8002/health  # Blockchain
curl http://localhost:8000/health  # Orchestrator
```

### Logs
Each service provides detailed logging for debugging and monitoring.

### Metrics
- Model performance metrics
- System resource usage
- Request/response times
- Error rates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## License

[Add your license information here]

## Support

For issues and questions:
1. Check the API documentation
2. Review the logs
3. Run the test workflow
4. Create an issue on GitHub

---

**Built with ❤️ for the Active Learning community**
