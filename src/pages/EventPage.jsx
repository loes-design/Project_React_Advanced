import React, { useState, useEffect } from "react";
import {
  Heading,
  Text,
  Image,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Input,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom"; // Import

export const EventPage = () => {
  const { eventId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const [eventDetails, setEventDetails] = useState(null);
  const [editedEvent, setEditedEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    categoryIds: [],
    createdBy: null,
  });

  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      const eventData = await response.json();
      setEventDetails(eventData);

      // Fetch user details only if creator ID exists
      if (eventData.createdBy) {
        const userResponse = await fetch(
          `http://localhost:3000/users/${eventData.createdBy}`
        );
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details");
        }
        const userData = await userResponse.json();
        setEventDetails((prevDetails) => ({
          ...prevDetails,
          creator: userData,
        }));
      }

      // Initialize the editedEvent state with the existing event details
      setEditedEvent({
        title: eventData.title,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        categoryIds: eventData.categoryIds,
      });
    } catch (error) {
      console.error("Error fetching event details:", error);
      // Handle error state if needed
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedEvent),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      // Event updated successfully, close the modal and fetch updated details
      onClose();
      fetchEventDetails();

      // Set success message
      setSuccessMessage("Event updated successfully");
      setErrorMessage(null);
    } catch (error) {
      console.error("Error updating event:", error);
      // Handle error state if needed
      setErrorMessage("Failed to update the event");
      setSuccessMessage(null);
    }
  };

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const handleDelete = () => {
    // Open the delete confirmation alert
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      // Event deleted successfully, close the alert and show success message
      setIsDeleteAlertOpen(false);
      setSuccessMessage("Event deleted successfully");
      setErrorMessage(null);

      navigate(`/`);
    } catch (error) {
      console.error("Error deleting event:", error);
      // Handle error state if needed
      setIsDeleteAlertOpen(false);
      setErrorMessage("Failed to delete the event");
      setSuccessMessage(null);
    }
  };

  const handleDeleteCancelled = () => {
    // Close the delete confirmation alert
    setIsDeleteAlertOpen(false);
  };

  if (!eventDetails) {
    return <Heading>Loading...</Heading>;
  }

  return (
    <div>
      <Heading>{eventDetails.title}</Heading>
      <Image src={eventDetails.image} alt={eventDetails.title} />
      <Text>{eventDetails.description}</Text>
      <Text> Start Time {eventDetails.startTime}</Text>
      <Text> End Time {eventDetails.endTime}</Text>
      <Text>
        Categories:
        {eventDetails.categoryIds}
      </Text>
      {eventDetails.creator && (
        <Text>
          Created by: {eventDetails.creator.name}
          <Image
            src={eventDetails.creator.image}
            alt={eventDetails.creator.name}
          />
        </Text>
      )}
      <Text>
        <Button onClick={onOpen}>Edit</Button>
        {/* Open the delete confirmation alert on button click */}
        <Button colorScheme="red" onClick={handleDelete}>
          Delete
        </Button>
      </Text>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Form for editing the event */}
            <Text> Adjust the Title of this Event</Text>
            <Input
              type="text"
              placeholder="Title"
              name="title"
              value={editedEvent.title}
              onChange={handleInputChange}
            />
            <Text> Adjust the Description of this Event</Text>
            <Textarea
              placeholder="Description"
              name="description"
              value={editedEvent.description}
              onChange={handleInputChange}
            />
            <Text> Adjust the Start Time of this Event</Text>
            <Input
              type="datetime-local"
              name="startTime"
              value={editedEvent.startTime}
              onChange={handleInputChange}
            />
            <Text> Adjust the End Time of this Event</Text>
            <Input
              type="datetime-local"
              name="endTime"
              value={editedEvent.endTime}
              onChange={handleInputChange}
            />
            <Text> Adjust the Image of this Event</Text>
            <Input
              type="text"
              placeholder="New Image"
              name="image"
              value={editedEvent.image}
              onChange={handleInputChange}
            />
            {/* Add other input fields for title, startTime, endTime, categoryIds */}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Display success or error messages */}
      {successMessage && <Text color="green">{successMessage}</Text>}
      {errorMessage && <Text color="red">{errorMessage}</Text>}

      {/* Delete confirmation alert */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={undefined}
        onClose={handleDeleteCancelled}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={handleDeleteCancelled}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDeleteConfirmed} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
};
