require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");

const Role = require("../models/role");
const Permission = require("../models/Permission");
const User = require("../models/User");

const {
    hashPassword,
} = require("../utils/password");

const seed = async () => {
    await connectDB();

    const permissionData = [
        {
            slug: "vendor.approve",
            name: "Approve vendors",
        },
        {
            slug: "vendor.reject",
            name: "Reject vendors",
        },
        {
            slug: "vendor.read",
            name: "Read vendors",
        },
        {
            slug: "service.create",
            name: "Create services",
        },
        {
            slug: "service.update",
            name: "Update services",
        },
        {
            slug: "booking.create",
            name: "Create bookings",
        },
        {
            slug: "booking.read",
            name: "Read bookings",
        },
        {
            slug: "booking.cancel",
            name: "Cancel bookings",
        },
        {
            slug: "booking.confirm",
            name: "Confirm bookings",
        },
        {
            slug: "booking.reject",
            name: "Reject bookings",
        },
        {
            slug: "booking.complete",
            name: "Complete bookings",
        },
        {
            slug: "category.create",
            name: "Create categories",
        },
        {
            slug: "category.read",
            name: "Read categories",
        },
        {
            slug: "category.update",
            name: "Update categories",
        },
        {
            slug: "category.delete",
            name: "Delete categories",
        },
        {
            slug: "service.read",
            name: "Read services",
        },
        {
            slug: "service.delete",
            name: "Delete services",
        },
        {
            slug: "offering.create",
            name: "Create offerings",
        },
        {
            slug: "offering.read",
            name: "Read offerings",
        },
        {
            slug: "offering.update",
            name: "Update offerings",
        },
        {
            slug: "offering.delete",
            name: "Delete offerings",
        },
        {
            slug: "availability.create",
            name: "Create availability",
        },
        {
            slug: "availability.read",
            name: "Read availability",
        },
        {
            slug: "availability.update",
            name: "Update availability",
        },
        {
            slug: "availability.delete",
            name: "Delete availability",
        },
        {
            slug: "payment.create",
            name: "Create payments",
        },
        {
            slug: "payment.read",
            name: "Read payments",
        },
        {
            slug: "payment.refund",
            name: "Refund payments",
        },
    ];

    const permissions = [];

    for (const permission of permissionData) {
        const existing = await Permission.findOne({
            slug: permission.slug,
        });

        if (existing) {
            permissions.push(existing);
        } else {
            const created = await Permission.create(permission);
            permissions.push(created);
        }
    }

    const permissionMap = new Map(
        permissions.map((permission) => [
            permission.slug,
            permission._id,
        ])
    );

    let customerRole = await Role.findOne({
        slug: "CUSTOMER",
    });

    const customerPermissions = [
        permissionMap.get("booking.create"),
        permissionMap.get("booking.read"),
        permissionMap.get("booking.cancel"),
        permissionMap.get("payment.create"),
        permissionMap.get("payment.read"),
    ].filter(Boolean);

    if (!customerRole) {
        customerRole = await Role.create({
            name: "Customer",
            slug: "CUSTOMER",
            permissions: customerPermissions,
        });
    } else {
        customerRole.permissions = customerPermissions;
        await customerRole.save();
    }
    let vendorRole = await Role.findOne({
        slug: "VENDOR",
    });

    const vendorPermissions = [
        permissionMap.get("service.create"),
        permissionMap.get("vendor.read"),
        permissionMap.get("service.read"),
        permissionMap.get("service.update"),
        permissionMap.get("service.delete"),
        permissionMap.get("offering.create"),
        permissionMap.get("offering.read"),
        permissionMap.get("offering.update"),
        permissionMap.get("offering.delete"),
        permissionMap.get("booking.read"),
        permissionMap.get("booking.confirm"),
        permissionMap.get("booking.reject"),
        permissionMap.get("booking.complete"),
        permissionMap.get("availability.create"),
        permissionMap.get("availability.read"),
        permissionMap.get("availability.update"),
        permissionMap.get("availability.delete"),
    ].filter(Boolean);

    if (!vendorRole) {
        vendorRole = await Role.create({
            name: "Vendor",
            slug: "VENDOR",
            permissions: vendorPermissions,
        });
    } else {
        vendorRole.permissions = vendorPermissions;

        await vendorRole.save();
    }

    let adminRole = await Role.findOne({
        slug: "ADMIN",
    });

    if (!adminRole) {
        adminRole = await Role.create({
            name: "Admin",
            slug: "ADMIN",
            permissions: permissions.map(
                (permission) => permission._id
            ),
        });
    } else {
        adminRole.permissions = permissions.map(
            (permission) => permission._id
        );

        await adminRole.save();
    }

    const existingAdmin = await User.findOne({
        email: "admin@gmail.com",
    });

    if (!existingAdmin) {
        const password = await hashPassword("Admin@123");

        await User.create({
            name: "Admin",
            email: "admin@gmail.com",
            password,
            role: adminRole._id,
            status: "ACTIVE",
        });
    }

    console.log("Roles and admin seeded");

    await mongoose.connection.close();
};

seed().catch(async (error) => {
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
});