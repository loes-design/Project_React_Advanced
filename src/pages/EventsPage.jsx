import React, { useState, useEffect } from "react";
import {
  Heading,
  Input,
  Select,
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
  Checkbox,
  FormControl,
  Text,
  Box,
  SimpleGrid,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    image: "",
    categoryIds: [],
    location: "",
    startTime: "",
    endTime: "",
  });

  const [userData, setUserData] = useState([]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:3000/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const eventData = await response.json();
      setEvents(eventData);
    } catch (error) {
      console.error("Error fetching events:", error);
      // Handle error state if needed
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
      // Handle error state if needed
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const userData = await response.json();
      setUserData(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Handle error state if needed
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchUsers();
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const openAddEventModal = () => {
    onOpen();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (categoryId) => {
    setNewEvent((prevEvent) => {
      const categoryIds = prevEvent.categoryIds.includes(categoryId)
        ? prevEvent.categoryIds.filter((id) => id !== categoryId)
        : [...prevEvent.categoryIds, categoryId];

      return {
        ...prevEvent,
        categoryIds,
      };
    });
  };

  const handleAddEvent = async () => {
    try {
      // Check if user exists
      let userExists = false;
      let userId = null;

      // Check if user already exists
      const existingUser = userData.find(
        (user) => user.name === newEvent.userName
      );
      if (existingUser) {
        userExists = true;
        userId = existingUser.id;
      }

      // If user does not exist, prompt for image URL
      if (!userExists && newEvent.userName) {
        const userImage = newEvent.userImage;

        // Add new user to the server
        const newUserResponse = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newEvent.userName,
            image: userImage || "", // Set empty string if no image URL provided
          }),
        });

        if (!newUserResponse.ok) {
          throw new Error("Failed to add new user");
        }

        const newUser = await newUserResponse.json();
        userId = newUser.id;
      }

      const response = await fetch("http://localhost:3000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newEvent, createdBy: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add the new event");
      }

      // Event added successfully, close the modal and fetch updated events
      onClose();
      fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
      // Handle error state ifneeded
    }
  };

  return (
    <Box p={4} m={5}>
      <Heading>List of Events</Heading>
      <Input
        placeholder="Search events"
        value={searchTerm}
        onChange={handleSearch}
        m={1}
      />
      <Select
        placeholder="Filter by category"
        value={selectedCategory}
        onChange={handleCategoryChange}
        m={1}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} m={10} spacing={20}>
        {events
          .filter((event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .filter(
            (event) =>
              selectedCategory === "" ||
              event.categoryIds.includes(Number(selectedCategory))
          )
          .map((event) => (
            <Link key={event.id} to={`/event/${event.id}`}>
              <strong>Title:</strong> {event.title}
              <br />
              <strong>Description:</strong> {event.description}
              <br />
              <strong>Image:</strong>{" "}
              <img src={event.image} alt="Event" width="200" />
              <br />
              <strong>Start Time:</strong>{" "}
              {new Date(event.startTime).toLocaleString()}
              <br />
              <strong>End Time:</strong>{" "}
              {new Date(event.endTime).toLocaleString()}
              <br />
              <strong>Categories:</strong>{" "}
              {categories.length > 0 &&
                getCategoryName(event.categoryIds, categories).join(", ")}
              <br />
              <br />
              <strong>Location:</strong> {event.location}
              <br />
              {/* Other event details... */}
            </Link>
          ))}
      </SimpleGrid>
      <Button
        onClick={() => {
          const userName = prompt("Your name:");
          if (userName) {
            setNewEvent((prevEvent) => ({
              ...prevEvent,
              userName: userName,
            }));

            // Check if user already exists
            const existingUser = userData.find(
              (user) => user.name === userName
            );
            if (!existingUser) {
              const userImage = prompt("User image URL (optional):");
              setNewEvent((prevEvent) => ({
                ...prevEvent,
                userImage: userImage || "", // Set empty string if no image URL provided
              }));
            }

            openAddEventModal();
          }
        }}
        m={4}
      >
        Add New Event
      </Button>

      {/* Modal for adding a new event */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Form for adding a new event */}
            <Text> Title of New Event</Text>
            <Input
              type="text"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
            />
            <Text> Discription of New Event</Text>
            <Textarea
              name="description"
              value={newEvent.description}
              onChange={handleInputChange}
            />
            <Text> Add the Image URL of New Event</Text>
            <Input
              type="text"
              name="image"
              value={newEvent.image}
              onChange={handleInputChange}
            />
            {/* Add other input fields for categoryIds, location, startTime, endTime */}
            <Text> Select the Categories of New Event</Text>
            <FormControl>
              {categories.map((category) => (
                <Box key={category.id} mb={2}>
                  <Checkbox
                    key={category.id}
                    value={category.id}
                    isChecked={newEvent.categoryIds.includes(category.id)}
                    onChange={() => handleCheckboxChange(category.id)}
                  >
                    {category.name}
                  </Checkbox>
                </Box>
              ))}
            </FormControl>
            <Text> Add the Location of New Event</Text>
            <Input
              type="text"
              name="location"
              value={newEvent.location}
              onChange={handleInputChange}
            />
            <Text> Add the Start time and date of New Event</Text>
            <Input
              type="datetime-local"
              name="startTime"
              value={newEvent.startTime}
              onChange={handleInputChange}
            />
            <Text> Add the End time and date of New Event</Text>
            <Input
              type="datetime-local"
              name="endTime"
              value={newEvent.endTime}
              onChange={handleInputChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleAddEvent}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EventsPage;
