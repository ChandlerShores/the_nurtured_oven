import { bakerAudience } from "./audience"
import type { SopRegistry } from "./types"
import { customerUpdatesWorkflow } from "./workflows/customer-updates"
import { deliveryOrdersWorkflow } from "./workflows/delivery-orders"
import { openCloseOrderingWorkflow } from "./workflows/open-close-ordering"
import { pickupOrdersWorkflow } from "./workflows/pickup-orders"
import { reviewPaidOrdersWorkflow } from "./workflows/review-paid-orders"
import { updateWeeklyMenuWorkflow } from "./workflows/update-weekly-menu"

export const sopRegistry: SopRegistry = {
  appName: "The Nurtured Oven Admin",
  audience: bakerAudience,
  routes: {
    adminDashboard: {
      label: "Admin dashboard",
      path: "/admin",
      purpose: "Start page for the baker portal.",
    },
    adminMenu: {
      label: "Admin menu",
      path: "/admin/menu",
      purpose: "Update weekly menu items and preview what customers see.",
    },
    adminOrders: {
      label: "Admin orders",
      path: "/admin/orders",
      purpose: "Review paid orders.",
    },
    adminDeliveries: {
      label: "Admin deliveries",
      path: "/admin/deliveries",
      purpose: "Plan and review delivery orders.",
    },
    adminPickup: {
      label: "Admin pickup",
      path: "/admin/pickup",
      purpose: "Review pickup orders.",
    },
    adminMessages: {
      label: "Admin messages",
      path: "/admin/messages",
      purpose: "Send customer updates.",
    },
    adminDocs: {
      label: "Admin docs",
      path: "/admin/docs",
      purpose: "Browse baker-facing SOPs and training guides.",
    },
    adminFinancials: {
      label: "Admin financials",
      path: "/admin/financials",
      purpose: "Review bakery financial summaries.",
    },
    adminSettings: {
      label: "Admin notes",
      path: "/admin/settings",
      purpose: "Manage ordering controls and admin setup notes.",
    },
    publicHome: {
      label: "Public home",
      path: "/",
      purpose: "Check what customers see on the home page.",
    },
    publicMenu: {
      label: "Public menu",
      path: "/menu",
      purpose: "Check what customers see on the menu page.",
    },
    publicOrderSuccess: {
      label: "Order success page",
      path: "/order/success",
      purpose: "Check the customer confirmation page after payment.",
    },
    publicContact: {
      label: "Public contact page",
      path: "/contact",
      purpose: "Check inquiry and reminder forms.",
    },
  },
  selectors: [
    {
      dataSop: "admin-nav-menu",
      description: "Sidebar link to the Menu area.",
      route: "adminDashboard",
    },
    {
      dataSop: "admin-menu-page",
      description: "Main admin Menu page.",
      route: "adminMenu",
    },
    {
      dataSop: "admin-menu-live-section",
      description: "Live menu items section.",
      route: "adminMenu",
    },
    {
      dataSop: "menu-item-card",
      description: "A menu item card.",
      route: "adminMenu",
      repeated: true,
    },
    {
      dataSop: "menu-item-edit",
      description: "Edit button on a menu item card.",
      route: "adminMenu",
      repeated: true,
    },
    {
      dataSop: "menu-item-editor",
      description: "Menu item editor drawer.",
      route: "adminMenu",
    },
    {
      dataSop: "menu-item-name",
      description: "Menu item name field.",
      route: "adminMenu",
    },
    {
      dataSop: "menu-item-description",
      description: "Menu item description field.",
      route: "adminMenu",
    },
    {
      dataSop: "menu-item-price",
      description: "Menu item price field.",
      route: "adminMenu",
    },
    {
      dataSop: "menu-item-active-toggle",
      description: "Live checkbox in the menu item editor.",
      route: "adminMenu",
    },
    {
      dataSop: "menu-item-featured-toggle",
      description: "Featured checkbox in the menu item editor.",
      route: "adminMenu",
    },
    {
      dataSop: "menu-item-image",
      description: "Menu item photo upload field.",
      route: "adminMenu",
    },
    {
      dataSop: "menu-item-save",
      description: "Save button in the menu item editor.",
      route: "adminMenu",
    },
    {
      dataSop: "menu-item-cancel",
      description: "Close button in the menu item editor.",
      route: "adminMenu",
    },
    {
      dataSop: "ordering-status-card",
      description: "Admin ordering status card.",
      route: "adminSettings",
    },
    {
      dataSop: "ordering-toggle",
      description: "Button to close or re-open ordering.",
      route: "adminSettings",
    },
    {
      dataSop: "menu-item-sold-out-toggle",
      description: "Button to mark an item sold out or back in stock.",
      route: "adminSettings",
      repeated: true,
    },
    {
      dataSop: "public-menu-link",
      description: "Link to open the public menu.",
      route: "adminSettings",
    },
    {
      dataSop: "public-menu-page",
      description: "Customer-facing menu page.",
      route: "publicMenu",
    },
    {
      dataSop: "admin-orders-page",
      description: "Main admin Orders page.",
      route: "adminOrders",
    },
    {
      dataSop: "orders-new-review-card",
      description: "New orders review card on the Orders page.",
      route: "adminOrders",
    },
    {
      dataSop: "orders-table",
      description: "Orders table with customer, items, fulfillment, and status.",
      route: "adminOrders",
    },
    {
      dataSop: "order-row",
      description: "A single order row or card.",
      route: "adminOrders",
      repeated: true,
    },
    {
      dataSop: "order-open",
      description: "Open link for a single order.",
      route: "adminOrders",
      repeated: true,
    },
    {
      dataSop: "admin-pickup-page",
      description: "Main admin Pickup page.",
      route: "adminPickup",
    },
    {
      dataSop: "pickup-overview",
      description: "Pickup summary metrics.",
      route: "adminPickup",
    },
    {
      dataSop: "pickup-notify",
      description: "Pickup notification controls.",
      route: "adminPickup",
    },
    {
      dataSop: "pickup-queue",
      description: "Pickup order queue.",
      route: "adminPickup",
    },
    {
      dataSop: "pickup-picked-up-button",
      description: "Button to mark a pickup order complete.",
      route: "adminPickup",
      repeated: true,
    },
    {
      dataSop: "admin-deliveries-page",
      description: "Main admin Deliveries page.",
      route: "adminDeliveries",
    },
    {
      dataSop: "delivery-overview",
      description: "Delivery summary metrics.",
      route: "adminDeliveries",
    },
    {
      dataSop: "delivery-notify",
      description: "Delivery notification controls.",
      route: "adminDeliveries",
    },
    {
      dataSop: "delivery-route-builder",
      description: "Delivery route planning controls.",
      route: "adminDeliveries",
    },
    {
      dataSop: "delivery-mark-delivered",
      description: "Button to mark a delivery complete.",
      route: "adminDeliveries",
      repeated: true,
    },
    {
      dataSop: "admin-messages-page",
      description: "Main admin Messages page.",
      route: "adminMessages",
    },
    {
      dataSop: "admin-nav-docs",
      description: "Sidebar link to the Docs area.",
      route: "adminDashboard",
    },
    {
      dataSop: "admin-docs-page",
      description: "Main admin Docs page.",
      route: "adminDocs",
    },
    {
      dataSop: "admin-doc-open-guide",
      description: "Open guide link on a Docs card.",
      route: "adminDocs",
      repeated: true,
    },
    {
      dataSop: "customer-updates-composer",
      description: "Customer update composer.",
      route: "adminMessages",
    },
    {
      dataSop: "customer-updates-order-search",
      description: "Order search field for customer updates.",
      route: "adminMessages",
    },
    {
      dataSop: "messages-log",
      description: "Sent customer update log.",
      route: "adminMessages",
    },
  ],
  outputConventions: {
    markdownSops: "/docs/sops/baker/",
    htmlSops: "/docs/sops/baker/",
    screenshots: "/docs/sops/baker/images/{workflowSlug}/",
    templates: "/docs/sops/templates/",
  },
  workflows: [
    updateWeeklyMenuWorkflow,
    openCloseOrderingWorkflow,
    reviewPaidOrdersWorkflow,
    pickupOrdersWorkflow,
    deliveryOrdersWorkflow,
    customerUpdatesWorkflow,
  ],
}

export const sopWorkflowSummaries = sopRegistry.workflows.map((workflow) => ({
  slug: workflow.slug,
  title: workflow.title,
  ownerFacingTitle: workflow.ownerFacingTitle,
  purpose: workflow.purpose,
  riskLevel: workflow.riskLevel,
  recommendedTrainingFormat: workflow.recommendedTrainingFormat,
}))
