/* eslint-disable react/prop-types */
// eslint-disable-next-line react/prop-types
import { Divider, Flex, Modal, Table } from 'antd';

const ConfirmOrder = ({ open, setOpen, order }) => {
  return (
    <Flex vertical gap='middle' align='flex-start'>
      <Modal
        title='Thông tin đơn hàng'
        centered
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width={1000}
      >
        <Divider />
        <p>
          <strong>Tên:</strong> {order.customerName}
        </p>
        <p>
          <strong>Email:</strong> {order.customerEmail}
        </p>
        <p>
          <strong>Điện thoại:</strong> {order.customerPhone}
        </p>

        <h3>Thông tin giỏ hàng</h3>
        <Table
          dataSource={order.selectedProducts}
          rowKey='id'
          pagination={false}
          columns={[
            { title: 'Tên sản phẩm', dataIndex: 'name' },
            { title: 'Đơn giá', dataIndex: 'price' },
            { title: 'Số lượng', dataIndex: 'quantity' },
            {
              title: 'Tổng tiền',
              render: (_, record) => record.price * record.quantity,
            },
          ]}
        />

        <h3>Thông tin thanh toán</h3>
        <p>
          <strong>Phương thức thanh toán:</strong>{' '}
          {order.method === 'cash' ? 'Tiền mặt' : 'Thẻ'}
        </p>
        <p>
          <strong>Tổng tiền:</strong> {order.totalPrice.toLocaleString()}đ
        </p>

        {order.method === 'cash' && (
          <p>
            <strong>Tiền khách đưa:</strong>{' '}
            {order.priceOfCustomer.toLocaleString()}đ
          </p>
        )}
      </Modal>
    </Flex>
  );
};
export default ConfirmOrder;
