import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { Box, Text } from "@chakra-ui/react";

export const Root = () => {
  return (
    <Text>
      <Box p={4} borderWidth="1px" borderRadius="lg" borderShadow="md" m={5}>
        <Navigation />
        <Outlet />
      </Box>
    </Text>
  );
};
