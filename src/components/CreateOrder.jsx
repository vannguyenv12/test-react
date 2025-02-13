import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
  Table,
} from 'antd';
import { useState } from 'react';
import { couponList } from '../mocks/couponData';
import { productList } from '../mocks/productData';
import './animation.css';
import ConfirmOrder from './ConfirmOrder';

const { Option } = Select;

const initialOrder = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  selectedProducts: [],
  method: 'cash',
  priceOfCustomer: 0,
  totalPrice: 0,
};

const CreateOrder = () => {
  const [order, setOrder] = useState(initialOrder);

  // Modal
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  // Notification
  const [messageApi, contextHolder] = message.useMessage();

  const handleOrderChange = (e) => {
    setOrder({
      ...order,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectProduct = (productId) => {
    const product = productList.find((product) => product.id === productId);
    const cartItem = {
      ...product,
      quantity: 1,
      couponCode: '',
    };

    const existingProduct = order.selectedProducts.find(
      (product) => product.id === productId
    );

    if (existingProduct) {
      return;
    }

    setOrder({
      ...order,
      selectedProducts: [...order.selectedProducts, cartItem],
      totalPrice: order.totalPrice + product.price,
    });
  };

  const handleIncrQuantity = (value, cartProduct) => {
    const productIndex = order.selectedProducts.findIndex(
      (product) => product.id === cartProduct.id
    );

    if (productIndex !== -1) {
      const updatedProducts = [...order.selectedProducts];
      updatedProducts[productIndex] = {
        ...updatedProducts[productIndex],
        quantity: value,
      };

      const newTotalPrice = updatedProducts.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
      );

      setOrder({
        ...order,
        selectedProducts: updatedProducts,
        totalPrice: newTotalPrice,
      });
    }
  };

  const handleDeleteCart = (cartProduct) => {
    const row = document.getElementById(`row-${cartProduct.id}`);
    if (row) {
      row.style.transition = 'opacity 0.3s, transform 0.3s';
      row.style.opacity = '0';
      row.style.transform = 'scale(0.9)';

      setTimeout(() => {
        setOrder((prevOrder) => ({
          ...prevOrder,
          selectedProducts: prevOrder.selectedProducts.filter(
            (product) => product.id !== cartProduct.id
          ),
        }));
      }, 300);
    }
  };

  const handleApplyCoupon = (record) => {
    console.log('check record', record);
    const coupon = couponList.find((c) => c.code === record.couponCode);

    if (!coupon) {
      messageApi.error('⚠️ Mã khuyến mãi không hợp lệ!');
      return;
    }

    if (record.discount) {
      messageApi.warning('⚠️ Sản phẩm này đã áp dụng mã giảm giá!');
      return;
    }

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = (record.price * coupon.value) / 100;
    } else if (coupon.type === 'value') {
      discount = coupon.value;
    }

    const updatedProducts = order.selectedProducts.map((product) =>
      product.id === record.id
        ? { ...product, discount, totalPrice: product.price - discount }
        : product
    );

    const newTotalPrice = updatedProducts.reduce(
      (sum, product) => sum + product.totalPrice * product.quantity,
      0
    );

    setOrder({
      ...order,
      selectedProducts: updatedProducts,
      totalPrice: newTotalPrice,
    });

    messageApi.success(`🎉 Áp dụng mã ${coupon.code} thành công!`);
  };

  const handlePayment = () => {
    setOpenConfirmModal(true);
  };

  return (
    <>
      {contextHolder}
      <Form layout='vertical'>
        <Form.Item label='Tên khách hàng'>
          <Input
            placeholder='Nhập tên khách hàng'
            value={order.customerName}
            name='customerName'
            onChange={handleOrderChange}
          />
        </Form.Item>
        <Form.Item label='Email khách hàng'>
          <Input
            placeholder='Nhập email khách hàng'
            name='customerEmail'
            onChange={handleOrderChange}
          />
        </Form.Item>
        <Form.Item label='Số điện thoại khách hàng'>
          <Input
            placeholder='Nhập số điện thoại khách hàng'
            name='customerPhone'
            onChange={handleOrderChange}
          />
        </Form.Item>

        <Form.Item label='Thêm sản phẩm vào giỏ hàng'>
          <Select placeholder='Chọn sản phẩm' onChange={handleSelectProduct}>
            {productList.map((product) => (
              <Option key={product.id} value={product.id}>
                {product.name} - {product.price.toLocaleString()}đ
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Table
          dataSource={order.selectedProducts}
          rowKey='id'
          pagination={false}
          columns={[
            { title: 'Tên sản phẩm', dataIndex: 'name' },
            {
              title: 'Đơn giá',
              dataIndex: 'price',
              render: (text) => (
                <InputNumber min={1000} value={text} disabled />
              ),
            },
            {
              title: 'Số lượng',
              dataIndex: 'quantity',
              render: (text, record) => {
                return (
                  <InputNumber
                    min={1}
                    value={record.quantity}
                    onChange={(value) => handleIncrQuantity(value, record)}
                  />
                );
              },
            },
            {
              title: 'Mã khuyến mãi',
              dataIndex: 'couponCode',
              render: (_, record) => {
                return (
                  <div style={{ display: 'flex', gap: 5 }}>
                    <Input
                      placeholder='Nhập mã khuyến mãi'
                      value={record.couponCode}
                      onChange={(e) => {
                        const productIndex = order.selectedProducts.findIndex(
                          (product) => product.id === record.id
                        );
                        const updatedProducts = [...order.selectedProducts];

                        updatedProducts[productIndex] = {
                          ...updatedProducts[productIndex],
                          couponCode: e.target.value,
                        };

                        setOrder({
                          ...order,
                          selectedProducts: updatedProducts,
                        });
                      }}
                    />
                    <Button
                      variant='outlined'
                      color='orange'
                      onClick={() => handleApplyCoupon(record)}
                      // disabled={!!record.discount}
                    >
                      Áp dụng
                    </Button>
                  </div>
                );
              },
            },
            {
              title: 'Tổng tiền',
              render: (_, record) => (
                <span>
                  {(
                    (record.totalPrice ?? record.price) * record.quantity
                  ).toLocaleString()}
                  đ{' '}
                </span>
              ),
            },
            {
              title: 'Actions',
              render: (_, record) => (
                <tr id={`row-${record.id}`}>
                  <td>
                    <Button
                      color='red'
                      variant='outlined'
                      onClick={() => handleDeleteCart(record)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ),
            },
          ]}
        />

        <Card style={{ marginTop: 10 }}>
          <h3>Tổng tiền: {order.totalPrice} VND</h3>
        </Card>

        <Form.Item label='Phương thức thanh toán'>
          <Radio.Group
            onChange={(e) => setOrder({ ...order, method: e.target.value })}
            value={order.method}
          >
            <Radio value='cash'>Tiền mặt</Radio>
            <Radio value='card'>Thẻ</Radio>
          </Radio.Group>
        </Form.Item>

        {order.method === 'cash' && (
          <Form.Item label='Số tiền khách đưa'>
            <Input
              placeholder='Nhập số tiền khách đưa'
              name='priceOfCustomer'
              onChange={handleOrderChange}
              type='number'
            />
            {order.priceOfCustomer > order.totalPrice && (
              <span style={{ marginLeft: '5px', color: 'red' }}>
                Tiền thừa trả khách - Bạn cần trả{' '}
                {order.priceOfCustomer - order.totalPrice} VND
              </span>
            )}
          </Form.Item>
        )}

        <Button
          type='primary'
          onClick={handlePayment}
          style={{ textAlign: 'center', width: '100%' }}
        >
          Thanh toán
        </Button>
      </Form>

      <ConfirmOrder
        open={openConfirmModal}
        setOpen={setOpenConfirmModal}
        order={order}
      />
    </>
  );
};

export default CreateOrder;
