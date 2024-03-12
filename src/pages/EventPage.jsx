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
  Box,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";

export const EventPage = () => {
  const { eventId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
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
  const [eventCreator, setEventCreator] = useState(null);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      const eventData = await response.json();
      setEventDetails(eventData);

      fetchEventCreator(eventData.createdBy);

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
          userData,
        }));
      }

      setEditedEvent({
        title: eventData.title,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        categoryIds: eventData.categoryIds,
        createdBy: eventData.createdBy,
      });
    } catch (error) {
      console.error("Error fetching event details:", error);
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

  const fetchEventCreator = async (creatorId) => {
    try {
      const response = await fetch(`http://localhost:3000/users/${creatorId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event creator details");
      }
      const creatorData = await response.json();
      setEventCreator(creatorData);
    } catch (error) {
      console.error("Error fetching event creator details:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const categoryData = await response.json();
      setCategories(categoryData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryName = (categoryIds, categories) => {
    if (!categoryIds || !categories) return [];

    const categoryMap = categories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});

    const categoryNames = categoryIds.map(
      (categoryId) => categoryMap[categoryId]
    );

    return categoryNames;
  };

  const handleEditClick = async () => {
    try {
      const userName = prompt("Your name:");
      if (userName) {
        const existingUserResponse = await fetch(
          `http://localhost:3000/users?name=${userName}`
        );
        if (existingUserResponse.ok) {
          const existingUserData = await existingUserResponse.json();
          if (existingUserData.length > 0) {
            const existingUser = existingUserData[0];
            setEditedEvent((prevEvent) => ({
              ...prevEvent,
              userName: existingUser.name,
              userImage: existingUser.image || "",
              createdBy: existingUser.id, // Gebruik de ID van de bestaande gebruiker
            }));
          } else {
            const userImage = prompt("User image URL (optional):");
            const newUserResponse = await fetch(`http://localhost:3000/users`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: userName,
                image: userImage || "",
              }),
            });
            if (newUserResponse.ok) {
              const newUser = await newUserResponse.json();
              setEditedEvent((prevEvent) => ({
                ...prevEvent,
                userName: newUser.name,
                userImage: newUser.image || "",
                createdBy: newUser.id, // Gebruik de ID van de nieuwe gebruiker
              }));
            } else {
              throw new Error("Failed to create new user");
            }
          }
          onOpen();
        } else {
          throw new Error("Failed to fetch user");
        }
      }
    } catch (error) {
      console.error("Error handling edit click:", error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedEventData = { ...eventDetails }; // Maak een kopie van de originele gegevens

      // Update de velden met de nieuwe waarden
      Object.keys(editedEvent).forEach((key) => {
        // Controleer of de nieuwe waarde leeg is
        if (editedEvent[key] !== "") {
          // Update alleen als de nieuwe waarde niet leeg is
          updatedEventData[key] = editedEvent[key];
        }
      });

      // Stuur de bijgewerkte gegevens naar de server
      const response = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEventData),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      onClose();
      fetchEventDetails();

      setSuccessMessage("Event updated successfully");
      setErrorMessage(null);
    } catch (error) {
      console.error("Error updating event:", error);
      setErrorMessage("Failed to update the event");
      setSuccessMessage(null);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setSuccessMessage("Event deleted successfully");
      setErrorMessage(null);

      navigate(`/`);
    } catch (error) {
      console.error("Error deleting event:", error);
      setErrorMessage("Failed to delete the event");
      setSuccessMessage(null);
    }
  };

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const handleDeleteCancelled = () => {
    setIsDeleteAlertOpen(false);
  };

  if (!eventDetails) {
    return <Heading>Loading...</Heading>;
  }

  return (
    <Box p={4} m={5}>
      <Heading>{eventDetails.title}</Heading>
      <Image
        src={eventDetails.image}
        alt={eventDetails.title}
        boxSize="500px"
        objectFit="cover"
        m={4}
      />
      <Text m={4}>{eventDetails.description}</Text>
      <Text m={4}>
        <strong>Start Time:</strong>{" "}
        {new Date(eventDetails.startTime).toLocaleString()}
        <br />
        <strong>End Time:</strong>{" "}
        {new Date(eventDetails.endTime).toLocaleString()}
        <br />
      </Text>
      <Text m={4}>
        <strong>Categories:</strong>{" "}
        {categories.length > 0 &&
          getCategoryName(eventDetails.categoryIds, categories).join(", ")}
      </Text>
      <Text m={4}>
        <strong> Created by: </strong>
        {eventCreator && (
          <>
            {eventCreator.name}
            <br />
            <Image
              src={eventCreator.image}
              boxSize="100px"
              objectFit="cover"
              alt={eventCreator.name}
            />
          </>
        )}
      </Text>

      <Text>
        <Button onClick={handleEditClick}>Edit</Button>
        <Button colorScheme="red" onClick={() => setIsDeleteAlertOpen(true)}>
          Delete
        </Button>
      </Text>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {successMessage && <Text color="green">{successMessage}</Text>}
      {errorMessage && <Text color="red">{errorMessage}</Text>}
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
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
