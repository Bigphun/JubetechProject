import { Modal, Button, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';

interface DeleteUserProps {
  userId: string;
  onClose: () => void;
}

export default function DeleteUser({ userId, onClose }: DeleteUserProps) {
  const handleDelete = (): void => {
    fetch(`${import.meta.env.VITE_API_URL}/deleteUser/${userId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        return response.json();
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User deleted successfully',
          confirmButtonText: 'OK',
        }).then(() => {
          onClose();
          window.location.reload();
        });
      })
      .catch((error: Error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Error deleting user: ${error.message}`,
          confirmButtonText: 'OK',
        });
        console.error('Error deleting user:', error);
      });
  };

  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>Delete User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Are you sure you want to delete this user?</strong></p>
        <Col md={{ offset: 10 }}>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Col>
      </Modal.Body>
    </div>
  );
}
