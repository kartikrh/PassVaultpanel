import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Row, Col, Table, FormGroup, Label } from 'reactstrap';
import '../CommentaryCss.css';

const EventMarketModal = ({ isOpen, onClose, apiResponse, onSubmit }) => {
    const [selectedMarketType, setSelectedMarketType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [marketData, setMarketData] = useState({
        templateName: '',
        isOver: false,
        over: '',
        isPlayer: false,
        playerName: '',
        margin: '',
        delay: 0,
        isPerEvent: false,
    });
    const [runners, setRunners] = useState([]);
    const [dynamicMarkets, setDynamicMarkets] = useState([]);

    const { marketTemplate, categories, marketTypes } = apiResponse;

    useEffect(() => {
        if (selectedTemplate) {
            setMarketData({
                templateName: selectedTemplate.templateName,
                isOver: selectedTemplate.isOver,
                over: selectedTemplate.over,
                isPlayer: selectedTemplate.isPlayer,
                playerName: selectedTemplate.playerName,
                margin: selectedTemplate.margin,
                delay: selectedTemplate.delay,
                isPerEvent: selectedTemplate.isPerEvent,
            });
            setRunners(selectedTemplate.runners || []);
        } else {
            setMarketData({
                templateName: '',
                isOver: false,
                over: '',
                isPlayer: false,
                playerName: '',
                margin: '',
                delay: 0,
                isPerEvent: false,
            });
            setRunners([]);
        }
    }, [selectedTemplate]);

    const handleMarketTypeChange = (value) => {
        setSelectedMarketType(value);
        setSelectedCategory('');
        setSelectedTemplate(null);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        setSelectedTemplate(null);
    };

    const handleTemplateChange = (value) => {
        const template = marketTemplate.find(t => t.marketTemplateId === parseInt(value));
        setSelectedTemplate(template);
    };

    const handleMarketDataChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMarketData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddRunner = () => {
        setRunners([...runners, {
            runner: '',
            line: 0,
            overRate: 0,
            underRate: 0,
            selectionId: Date.now().toString(),
            order: runners.length + 1,
            backPrice: 0,
            layPrice: 0,
            backSize: 0,
            laySize: 0
        }]);
    };

    const handleRunnerChange = (index, field, value) => {
        const updatedRunners = [...runners];
        updatedRunners[index] = { ...updatedRunners[index], [field]: value };
        setRunners(updatedRunners);
    };

    const handleRemoveRunner = (index) => {
        const updatedRunners = runners.filter((_, i) => i !== index);
        setRunners(updatedRunners);
    };

    const handleAddMarket = () => {
        const newMarket = {
            marketTypeId: selectedMarketType,
            marketTypeCategoryId: selectedCategory,
            marketTemplateId: selectedTemplate ? selectedTemplate.marketTemplateId : null,
            ...marketData,
            runners: runners
        };
        setDynamicMarkets([...dynamicMarkets, newMarket]);
        // Reset form
        setSelectedMarketType('');
        setSelectedCategory('');
        setSelectedTemplate(null);
        setMarketData({
            templateName: '',
            isOver: false,
            over: '',
            isPlayer: false,
            playerName: '',
            margin: '',
            delay: 0,
            isPerEvent: false,
        });
        setRunners([]);
    };

    const handleRemoveMarket = (index) => {
        const updatedMarkets = dynamicMarkets.filter((_, i) => i !== index);
        setDynamicMarkets(updatedMarkets);
    };

    const handleSubmit = () => {
        onSubmit(dynamicMarkets);
        setDynamicMarkets([]);
    };

    return (
        <Modal isOpen={isOpen} toggle={onClose} size="xl" className="event-market-modal">
            <ModalHeader toggle={onClose}>Add Event Markets</ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={4}>
                        <Select
                            style={{ width: '100%', marginBottom: '10px' }}
                            value={selectedMarketType}
                            onChange={handleMarketTypeChange}
                            options={marketTypes.map(type => ({ value: type.marketTypeId.toString(), label: type.marketTypeName }))}
                            placeholder="Select Market Type"
                        />
                    </Col>
                    <Col md={4}>
                        <Select
                            style={{ width: '100%', marginBottom: '10px' }}
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            options={categories
                                .filter(cat => !selectedMarketType || cat.marketTypeId === parseInt(selectedMarketType))
                                .map(cat => ({ value: cat.marketTypeCategoryId.toString(), label: cat.categoryName }))}
                            placeholder="Select Category"
                            disabled={!selectedMarketType}
                        />
                    </Col>
                    <Col md={4}>
                        <Select
                            style={{ width: '100%', marginBottom: '10px' }}
                            value={selectedTemplate ? selectedTemplate.marketTemplateId.toString() : ''}
                            onChange={handleTemplateChange}
                            options={marketTemplate
                                .filter(template =>
                                    (!selectedMarketType || template.marketTypeId === parseInt(selectedMarketType)) &&
                                    (!selectedCategory || template.marketTypeCategoryId === parseInt(selectedCategory))
                                )
                                .map(template => ({ value: template.marketTemplateId.toString(), label: template.templateName }))}
                            placeholder="Select Template"
                            disabled={!selectedCategory}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <FormGroup>
                            <Label for="templateName">Market Name</Label>
                            <Input
                                type="text"
                                name="templateName"
                                id="templateName"
                                value={marketData.templateName}
                                onChange={handleMarketDataChange}
                                placeholder="Enter Market Name"
                            />
                        </FormGroup>
                    </Col>
                    <Col md={3}>
                        <FormGroup>
                            <Label for="margin">Margin</Label>
                            <Input
                                type="text"
                                name="margin"
                                id="margin"
                                value={marketData.margin}
                                onChange={handleMarketDataChange}
                                placeholder="Enter Margin"
                            />
                        </FormGroup>
                    </Col>
                    <Col md={3}>
                        <FormGroup>
                            <Label for="delay">Delay</Label>
                            <Input
                                type="number"
                                name="delay"
                                id="delay"
                                value={marketData.delay}
                                onChange={handleMarketDataChange}
                                placeholder="Enter Delay"
                            />
                        </FormGroup>
                    </Col>
                </Row>

                <Row>
                    <Col md={3}>
                        <FormGroup>
                            <Label for="isPlayer">Is Player</Label>
                            <Input
                                type="checkbox"
                                name="isPlayer"
                                id="isPlayer"
                                checked={marketData.isPlayer}
                                onChange={handleMarketDataChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col md={3}>
                        <FormGroup>
                            <Label for="playerName">Player Name</Label>
                            <Input
                                type="text"
                                name="playerName"
                                id="playerName"
                                value={marketData.playerName}
                                onChange={handleMarketDataChange}
                                placeholder="Enter Player Name"
                                disabled={!marketData.isPlayer}
                            />
                        </FormGroup>
                    </Col>
                </Row>

                <Row>
                    <Col md={3}>
                        <FormGroup>
                            <Label for="isOver">Is Over</Label>
                            <Input
                                type="checkbox"
                                name="isOver"
                                id="isOver"
                                checked={marketData.isOver}
                                onChange={handleMarketDataChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col md={3}>
                        <FormGroup>
                            <Label for="over">Over</Label>
                            <Input
                                type="text"
                                name="over"
                                id="over"
                                value={marketData.over}
                                onChange={handleMarketDataChange}
                                placeholder="Enter Over"
                                disabled={!marketData.isOver}
                            />
                        </FormGroup>
                    </Col>
                </Row>

                <h4>Runners</h4>
                <Table>
                    <thead>
                        <tr>
                            <th>Runner</th>
                            <th>Line</th>
                            <th>Over Rate</th>
                            <th>Under Rate</th>
                            <th>Order</th>
                            <th>Back Price</th>
                            <th>Lay Price</th>
                            <th>Back Size</th>
                            <th>Lay Size</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {runners.map((runner, index) => (
                            <tr key={runner.selectionId || index}>
                                <td>
                                    <Input
                                        value={runner.runner}
                                        onChange={(e) => handleRunnerChange(index, 'runner', e.target.value)}
                                        placeholder="Runner Name"
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="number"
                                        value={runner.line}
                                        onChange={(e) => handleRunnerChange(index, 'line', parseFloat(e.target.value))}
                                        placeholder="Line"
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="number"
                                        value={runner.overRate}
                                        onChange={(e) => handleRunnerChange(index, 'overRate', parseFloat(e.target.value))}
                                        placeholder="Over Rate"
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="number"
                                        value={runner.underRate}
                                        onChange={(e) => handleRunnerChange(index, 'underRate', parseFloat(e.target.value))}
                                        placeholder="Under Rate"
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="number"
                                        value={runner.order}
                                        onChange={(e) => handleRunnerChange(index, 'order', parseInt(e.target.value))}
                                        placeholder="Order"
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="number"
                                        value={runner.backPrice}
                                        onChange={(e) => handleRunnerChange(index, 'backPrice', parseFloat(e.target.value))}
                                        placeholder="Back Price"
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="number"
                                        value={runner.layPrice}
                                        onChange={(e) => handleRunnerChange(index, 'layPrice', parseFloat(e.target.value))}
                                        placeholder="Lay Price"
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="number"
                                        value={runner.backSize}
                                        onChange={(e) => handleRunnerChange(index, 'backSize', parseFloat(e.target.value))}
                                        placeholder="Back Size"
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="number"
                                        value={runner.laySize}
                                        onChange={(e) => handleRunnerChange(index, 'laySize', parseFloat(e.target.value))}
                                        placeholder="Lay Size"
                                    />
                                </td>
                                <td>
                                    <Button color="danger" onClick={() => handleRemoveRunner(index)}>Remove</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <Button color="primary" onClick={handleAddRunner} className="mt-3">Add Runner</Button>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={onClose}>Cancel</Button>
                <Button color="primary" onClick={handleSubmit}>Submit All Markets</Button>
            </ModalFooter>
        </Modal>
    );
};

export default EventMarketModal;