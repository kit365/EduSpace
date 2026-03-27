export const en = {
    common: {
        cancel: "Cancel",
        saveAndContinue: "Save & Continue",
        goBack: "Go Back",
        goBackHome: "Back to Home",
        previous: "Previous",
        continue: "Continue",
        publish: "Publish",
        browseFiles: "Browse Files",
        success: "Success!",
        loading: "Processing...",
        verified: "Verified",
        pending: "Pending",
        rejected: "Rejected",
        notUploaded: "Not Uploaded",
        upload: "Upload",
        reupload: "Reupload",
        save: "Save",
        book: "Book",
        seats: "seats",
        perHour: "/ hr",
        propertyTypes: {
            commercialBuilding: "Commercial Building",
            centerCoworking: "Center / Coworking",
            independentSpace: "Independent Space"
        },
        roomTypes: {
            meetingRoom: "Meeting Room",
            classroom: "Classroom / Training Room",
            eventSpace: "Event Space",
            studio: "Studio",
            coworking: "Coworking / Private Office"
        },
        sortBy: "Sort by:",
        recommended: "Recommended",
        priceLowHigh: "Price: Low → High",
        priceHighLow: "Price: High → Low",
        rating: "Rating",
        capacityLowHigh: "Capacity: Low → High",
        capacityHighLow: "Capacity: High → Low",
        verifiedSpace: "VERIFIED SPACE",
        spacesFound: "spaces in Ho Chi Minh City",
        showingResults: "Showing results for",
        error: {
            title: "Data Error",
            fetchUsers: "Could not fetch user list",
            fetchRoles: "Could not fetch role list",
            system: "A system error occurred"
        }
    },
    host: {
        register: {
            pageTitle: "Partner Registration",
            pageSubtitle: "Start your education space rental business with EduSpace",
            step1Label: "Info",
            step2Label: "Verify",
            step3Label: "Finish",
            step1Title: "Basic Information",
            step2Title: "KYC Verification",
            step3Title: "Confirm & Finish",
            typeLabel: "Partner Type",
            typeIndividual: "Individual",
            typeBusiness: "Business",
            labelName: "Full Name / Business Name",
            labelPhone: "Contact Phone",
            labelAddress: "Contact Address",
            placeholderNameInd: "John Doe",
            placeholderNameBus: "EduSpace LLC",
            placeholderAddress: "123 ABC Street, District 1, HCMC",
            kycDesc: "Please upload valid documents for account verification. This helps increase trust for your space.",
            docCccdFront: "ID - Front Side",
            docCccdFrontDesc: "Clear photo of the front side, no glare",
            docCccdBack: "ID - Back Side",
            docCccdBackDesc: "Clear photo of the back side, all info visible",
            docBusinessLicense: "Business License",
            docBusinessLicenseDesc: "Scan or photo of a valid license",
            summary: "Information Summary",
            documentsSubmitted: "Documents Prepared",
            termsHeader: "Terms of Service for Hosts",
            termsContent: "By registering, you agree to EduSpace's service fees (10-15%), space quality standards, and privacy policies.",
            agreeCheckbox: "I have read and agree to all terms above",
            submitApplication: "🚀 Submit Application",
            successTitle: "Application Submitted!",
            successMessage: "Your application is being received and processed.",
            pendingNotice: "Please wait up to 24h for the EduSpace team to verify your information."
        },
        listSpace: {
            onboarding: "Host Onboarding",
            title: "List Your Educational Space",
            steps: {
                basics: "Basics",
                location: "Location & Size",
                pricing: "Pricing & Availability",
                amenities: "Amenities",
                gallery: "Gallery"
            },
            basics: {
                title: "Basic Information",
                description: "Select a branch and enter the room name — address comes from the branch.",
                roomName: "Room name",
                roomNamePlaceholder: "e.g. VIP Meeting Room, Hall A",
                facilityName: "Facility Name",
                facilityPlaceholder: "e.g., EduSpace Saigon Hub",
                spaceType: "Space Type",
                chooseCategory: "Choose category",
                publicTitle: "Public Display Title",
                publicTitlePlaceholder: "What will users see? e.g., Standard AI Lab",
                intermediaryTip: "Tip: Users searching for space often filter by 'High-speed Wifi' and 'Ergonomic chairs'. Be descriptive!"
            },
            location: {
                title: "Location Details",
                description: "Help students find your exact location.",
                streetAddress: "Street Address",
                streetAddressPlaceholder: "Enter full address...",
                roomNumber: "Room number / code",
                roomNumberPlaceholder: "e.g. A101, P.305",
                addressSyncedFromBranch: "Address is taken from the selected branch to stay in sync with the branch profile.",
                branchHasNoAddress: "This branch has no address on file — update it on the Branches page, or enter a temporary address below.",
                area: "Area (m²)",
                guests: "Capacity",
                floor: "Floor Number"
            },
            pricing: {
                title: "Schedule & Pricing",
                description: "Manage hourly rates and weekend surcharges.",
                sessionAvailability: "Operating hours",
                open24Hours: "Open 24/7 (overnight)",
                openTime: "Opening time",
                closeTime: "Closing time",
                hourlyBaseRate: "Hourly Base Rate",
                pricePlaceholder: "Price per hour",
                dailyRate: "Daily rate",
                dailyPlaceholder: "Full-day rental price (VND)",
                dailyHint: "Stored on the room record (price_per_day). Separate from per-slot pricing.",
                weekendMarkup: "Weekend Markup",
                markupDescription: "Extra fee for Saturday & Sunday bookings. Helps cover peak operational costs.",
                slots: {
                    morning: "Morning",
                    afternoon: "Afternoon",
                    evening: "Evening"
                }
            },
            amenities: {
                title: "Teaching Equipment",
                description: "Show off what makes this room perfect for education.",
                items: {
                    projectors: "Dual Projectors",
                    whiteboard: "Whiteboard",
                    sound: "Sound System",
                    wifi: "Fiber Wifi 6",
                    ac: "Air Conditioning",
                    lounge: "Lounge Area"
                }
            },
            gallery: {
                title: "Photo Gallery",
                description: "Professional photos attract 3x more bookings.",
                dragDrop: "Drag & Drop",
                supportedTypes: "Types: PNG, JPG, JPEG (Max 20MB each)",
                spacePreview: "Space Preview"
            },
            success: {
                reviewText: "Your room listing for",
                isBeingReviewed: "is currently being reviewed by our team.",
                qualityCheck: "EduSpace Quality Check",
                qualityDescription: "We manually verify each listing to maintain educational standards. Expect approval within 24 hours.",
                goToPortal: "Go to Host Portal"
            },
            publishing: "Publishing your listing...",
            cancelListing: "Cancel Registration",
            validation: {
                selectBranch: "Please select a branch.",
                roomNameRequired: "Please enter the room name.",
                roomTypeRequired: "Please choose a space type.",
                titleRequired: "Please enter the public display title.",
                addressRequired: "Branch address is missing — update it on the Branches page or ensure the branch has an address.",
                roomNumberRequired: "Please enter the room number / code.",
                sizeRequired: "Please enter area (m²) greater than 0.",
                capacityRequired: "Please enter capacity greater than 0.",
                floorRequired: "Please enter a valid floor number (≥ 0).",
                openTimeRequired: "Please select opening time.",
                closeTimeRequired: "Please select closing time.",
                basePriceRequired: "Please enter an hourly rate greater than 0.",
                pricePerDayRequired: "Please enter a daily rate greater than 0.",
                imagesRequired: "Please add at least one photo.",
                fixCurrentStep: "Please complete all required fields in this step before continuing.",
                fixBeforePublish: "Some information is missing in \"{{step}}\". Please fill in the highlighted fields."
            }
        }
    },
    customer: {
        nav: {
            findSpace: "Find Space",
            favorites: "Favorites",
            myBookings: "My Bookings",
            listSpace: "List Your Space",
            forHosts: "For Hosts",
            help: "Help"
        },
        home: {
            hero: {
                title: "Find the Perfect Space for Your Next Class in Vietnam",
                subtitle: "Connecting educators with premium training venues and classrooms nationwide.",
                searchLocation: "Search Location in HCMC...",
                whenDate: "When? Date",
                capacity: "Capacity (10)",
                searchBtn: "Search"
            },
            categories: {
                title: "Featured Categories",
                viewAll: "View All",
                meetingRooms: "Meeting Rooms",
                meetingDesc: "Ideal for group discussions and workshops",
                classrooms: "Classrooms",
                classroomsDesc: "Traditional setups for structured learning",
                halls: "Halls",
                hallsDesc: "Large venues for seminars and events",
                spacesCount: "Spaces"
            },
            howItWorks: {
                title: "How it Works",
                forRenters: "For Renters",
                forHosts: "For Hosts",
                step1Title: "1. Find Your Venue",
                step1Desc: "Browse hundreds of verified classrooms based on location, size, and amenities.",
                step2Title: "2. Book Instantly",
                step2Desc: "Select your preferred date and time. Pay securely via credit card or local bank.",
                step3Title: "3. Teach & Succeed",
                step3Desc: "Arrive at your space, deliver a great class, and focus on what matters most.",
                hostStep1Title: "1. List Your Space",
                hostStep1Desc: "List your facility, upload attractive photos, and set your hourly rental rates.",
                hostStep2Title: "2. Get Verified",
                hostStep2Desc: "EduSpace experts will quickly review and verify your space to ensure quality standards.",
                hostStep3Title: "3. Get Paid",
                hostStep3Desc: "Our system automatically syncs schedules and deposits earnings directly to your account after each session."
            },
            topRated: {
                title: "Top Rated Spaces",
                subtitle: "Highly recommended classrooms by our community of teachers.",
                viewDetails: "View Details",
                perHour: "/ hr",
                pax: "pax",
                verified: "Verified",
                topRated: "Top Rated",
                featured: "Featured"
            },
            cta: {
                badge: "Increase Income",
                title: "Have an extra classroom/space? Become a Host on EduSpace today.",
                registerNow: "Register Now",
                feature1: "Optimize Earnings",
                feature2: "Simple Process",
                feature3: "Secure & Trusted",
                trustedBy: "Trusted by 500+ Hosts",
                testimonial: "EduSpace helped me connect with hundreds of students every month."
            }
        },
        spaceDetail: {
            loading: "Preparing your classroom...",
            notFound: "Space Not Found",
            notFoundDesc: "We couldn't find the space you're looking for. It might have been removed or the link is broken.",
            backToExplorer: "Back to Explorer",
            share: "Share",
            save: "Save",
            eduVerified: "Edu-Verified",
            rating: "Rating",
            capacity: "Capacity",
            size: "Size",
            aboutSpace: "About this space",
            whatOffers: "What this place offers",
            amenities: "Amenities",
            amenity: "amenity",
            location: "Location",
            reviews: "Reviews",
            seeAllReviews: "See all {{count}} reviews",
            perHour: "/ hour",
            date: "Date",
            checkIn: "Check-in",
            checkOut: "Check-out",
            guests: "Guests",
            notChargedYet: "You won't be charged yet.",
            freeCancellation: "Free cancellation within 24h.",
            selectContinue: "Select & Continue",
            hours: "hours",
            cleaningFee: "Cleaning fee",
            serviceFee: "Service fee",
            total: "Total",
            gallery: {
                viewAllPhotos: "See all photos ({{count}})"
            },
            tabs: {
                details: "Property details",
                policies: "Policies",
                reviews: "Reviews",
                messages: "Messages"
            },
            policiesTitle: "Booking Policies",
            policyCancellation: "Free cancellation within 24 hours after booking.",
            policyCheckIn: "Please check in within your selected time slot to guarantee room access.",
            contactHostTitle: "Contact Host",
            contactHostDesc: "Need more information about amenities, schedule, or booking support? Message the host directly.",
            contactHostBtn: "Message host",
            contactHostUnavailable: "This space does not have host contact information yet.",
            verifiedHost: "Verified Host",
            pricing: {
                open24Hours: "Open 24/7",
                perHour: "/ hour",
                total: "Total"
            },
            status: {
                open: "Open Now",
                closed: "Closed",
                opensAt: "Opens at {{time}}",
                closesAt: "Closes at {{time}}",
                open24_7: "Active 24/7"
            }
        },
        search: {
            title: "Search Spaces",
            filters: "Filters",
            clearAll: "Clear All",
            resultsFound: "results found",
            sortCapacityLowHigh: "Capacity: Low → High",
            sortCapacityHighLow: "Capacity: High → Low",
            district: "District",
            timeSlots: "Time Slots",
            priceRange: "Price Range (VNĐ/hr)",
            capacity: "Capacity",
            amenities: "Amenities",
            roomType: "Room Type",
            placeholder: "Where do you want to learn?",
            from: "From",
            to: "To",
            searching: "Searching for spaces...",
            noResults: "No spaces found",
            districtOptions: {
                all: "All Districts",
                quan1: "District 1",
                quan3: "District 3",
                quan7: "District 7",
                binhThanh: "Binh Thanh",
                phuNhuan: "Phu Nhuan",
                thuDuc: "Thu Duc City",
                tanBinh: "Tan Binh",
                goVap: "Go Vap"
            },
            capacityOptions: {
                small: "4–10 people",
                medium: "10–20 people",
                large: "20–30 people",
                xlarge: "30–50 people"
            },
            amenitiesOptions: {
                projector: "Projector",
                whiteboard: "Whiteboard",
                wifi: "High-speed Wifi",
                ac: "Air Conditioning",
                parking: "Parking",
                sound: "Sound System",
                webcam: "Webcam/Mic"
            },
            roomTypeOptions: {
                classroom: "Classroom",
                meeting: "Meeting Room",
                eventSpace: "Event Space",
                studio: "Studio",
                coworking: "Coworking / Private Office"
            }
        },
        ekyc: {
            title: "Identity Verification (eKYC)",
            description: "To ensure safety for the EduSpace community, please verify your identity with ID/Passport.",
            start: "Start Verification",
            steps: {
                front: "ID Front",
                back: "ID Back",
                selfie: "Portrait Photo",
                result: "Result"
            },
            processing: "System is extracting information (OCR) and matching faces. Please wait...",
            success: "Verification Successful!",
            failed: "Verification Failed",
            retry: "Retry",
            extractedInfo: "Extracted Info"
        },
        checkout: {
            title: "Booking",
            steps: {
                schedule: "Schedule",
                review: "Review Price",
                payment: "Payment",
                confirm: "Confirm"
            },
            schedule: {
                startDate: "Start Date",
                numDays: "Duration",
                startTime: "Start Time",
                endTime: "End Time",
                availabilityNote: "System automatically checks availability based on Host schedule."
            },
            pricing: {
                title: "Price Breakdown",
                holdTimer: "Hold",
                day: "Day",
                hours: "Hours",
                rate: "Rate/hr",
                subtotal: "Subtotal",
                grandTotal: "GRAND TOTAL",
                cleaningFee: "Cleaning Fee",
                serviceFee: "Service Fee"
            },
            payment: {
                onlineTitle: "Online Payment",
                submit: "Confirm & Pay",
                escrowNote: "Your payment is held in escrow and only released after check-in.",
                payDeposit: "Pay deposit (PayOS)",
                redirecting: "Redirecting to PayOS..."
            },
            depositReturn: {
                title: "Deposit payment result",
                waiting: "Confirming transaction...",
                success: "Deposit paid successfully.",
                bookingCode: "Booking code",
                pending: "Not confirmed yet. Please wait or refresh.",
                goBookings: "View bookings"
            },
            success: "Booking Successful! 🎉"
        },
        bookings: {
            title: "My Bookings",
            empty: "No bookings found",
            tabs: {
                upcoming: "Upcoming",
                completed: "Completed",
                cancelled: "Cancelled"
            },
            actions: {
                contact: "Contact",
                review: "Review"
            }
        },
        profile: {
            accountSettings: "Account Settings",
            sidebar: {
                myProfile: "My Profile",
                identity: "Identity",
                security: "Security",
                teams: "Teams",
                teamMember: "Team Member",
                alerts: "Notifications",
                billing: "Billing",
                dataExport: "Data Export",
                deleteAccount: "Delete Account",
                transactions: "Transaction History"
            },
            address: {
                title: "Address",
                cityState: "Province/City",
                district: "District",
                ward: "Ward",
                streetAddress: "Street address",
                postalCode: "Postal Code",
                taxId: "TAX ID"
            },
            premium: {
                title: "Premium Host",
                description: "Unlock advanced analytics and top-tier placement for your classrooms.",
                upgrade: "Upgrade Now"
            },
            header: {
                roles: {
                    renter: "Student / Learner",
                    guest: "Guest",
                    host: "Hoster",
                    staff: "Staff",
                    manager: "Manager",
                    admin: "Admin"
                },
                memberSince: "Member since",
                bookings: "bookings",
                reviews: "reviews",
                recently: "recently"
            },
            personal: {
                myProfile: "My Profile",
                firstName: "First Name",
                lastName: "Last Name",
                title: "Personal Information",
                edit: "Edit",
                fullName: "Full Name",
                email: "Email Address",
                phone: "Phone Number",
                location: "Location",
                bio: "Short Bio",
                save: "Save Changes",
                cancel: "Cancel",
                emailReadOnly: "Email cannot be changed"
            },
            security: {
                title: "Change Password",
                currentPassword: "Current Password",
                newPassword: "New Password",
                confirmPassword: "Confirm New Password",
                update: "Update Password",
                updating: "Updating...",
                currentPlaceholder: "Enter current password",
                newPlaceholder: "At least 8 characters",
                confirmPlaceholder: "Re-enter new password",
                twoFactor: {
                    title: "Two-Factor Authentication",
                    enabled: "Enabled",
                    disabled: "Disabled",
                    description: "Add an extra layer of security to your account by requiring a verification code when you log in.",
                    enable: "Enable 2FA",
                    disable: "Disable 2FA",
                    setup: {
                        title: "Setup Two-Factor Authentication",
                        step1: "1. Scan QR Code",
                        step2: "2. Enter Verification Code",
                        scanDesc: "Use Google Authenticator or Microsoft Authenticator to scan the QR code below.",
                        enterCode: "Enter 6-digit code from app",
                        verify: "Verify and Enable",
                        secretCode: "Secret Code (if QR doesn't work):",
                        success: "2FA enabled successfully!",
                        error: "Incorrect verification code.",
                        invalid: "Invalid verification code."
                    },
                    disableModal: {
                        title: "Disable Two-Factor Authentication",
                        desc: "To disable 2FA, please enter the verification code from your app to confirm your identity.",
                        confirm: "Confirm Disable 2FA",
                        success: "Two-factor authentication disabled."
                    }
                },
                passwordSuccess: "Password changed successfully!",
                passwordError: "Error changing password.",
                wrongPassword: "Current password is incorrect."
            },
            alerts: {
                title: "Notification Settings",
                emailSection: "Email Notifications",
                pushSection: "Push Notifications",
                bookingConfirm: {
                    title: "Booking Confirmations",
                    desc: "Receive emails when bookings are confirmed"
                },
                messages: {
                    title: "Messages",
                    desc: "Get notified when you receive new messages"
                },
                promotions: {
                    title: "Promotions & Tips",
                    desc: "Receive special offers and learning space tips"
                },
                pushEnable: {
                    title: "Enable Push Notifications",
                    desc: "Get instant updates on your device"
                },
                save: "Save Preferences"
            },
            billing: {
                title: "Payment Methods",
                addMethod: "Add Method",
                expiry: "Expiry",
                default: "Default",
                remove: "Remove",
                noMethods: "You haven't added any payment methods yet."
            },
            support: {
                chatWithStaff: "Chat with support staff",
            }
        }
    },
    footer: {
        description: "Vietnam's leading platform for educational space rental, connecting teachers and hosts since 2026.",
        explore: "Explore",
        findClassroom: "Find a Classroom",
        corporateEvents: "Corporate Events",
        spacesTrusted: "Spaces Trusted",
        pricingPlans: "Pricing Plans",
        hosting: "Hosting",
        becomeHost: "Become a Host",
        hostDashboard: "Host Dashboard",
        resources: "Resources",
        support: "Support",
        helpCenter: "Help Center",
        safetyHub: "Safety Hub",
        cancellationPolicy: "Cancellation Policy",
        termsOfService: "Terms of Service",
        allRightsReserved: "All rights reserved",
        privacyPolicy: "Privacy Policy",
        cookiePolicy: "Cookie Policy"
    },
    admin_sidebar: {
        dashboard: "Dashboard",
        messages: "Messages",
        finance: "Finance & Payouts",
        approvals: "Approvals & KYC",
        disputes: "Disputes & Reports",
        hosts: "Host Management",
        users: "User Management",
        roles: "Role & Perms",
        logs: "Audit Logs",
        settings: "System Settings",
        points: "Points & Rewards",
        depositPolicies: "Deposits & Refunds",
        signOut: "Sign Out",
        adminPortal: "Admin Portal",
        systemControl: "System Control"
    },
    depositPolicies: {
        title: "Deposit & refund policies",
        subtitle: "Configure deposit % and refund windows",
        add: "Add policy",
        name: "Policy name",
        description: "Description",
        depositPct: "Deposit %",
        default: "Default",
        active: "Active",
        actions: "Actions",
        create: "Create policy",
        edit: "Edit policy",
        defaultPolicy: "Default policy",
        displayOrder: "Display order",
        saved: "Policy saved",
        deleted: "Policy deleted",
        confirmDelete: "Delete this policy?"
    },
    bookingAdmin: {
        refundsTitle: "Refund requests by booking",
        bookingIdPlaceholder: "Booking ID",
        loadRefunds: "Load list",
        refundStatus: "Status",
        refundAmount: "Amount",
        refundReason: "Reason",
        handleRefund: "Handle",
        approve: "Approve refund",
        reject: "Reject",
        adminNote: "Admin note",
        transactionId: "Refund transaction ID",
        refundHandled: "Updated"
    },
    admin_management: {
        title: "User Management",
        subtitle: "Manage system roles and permissions",
        searchPlaceholder: "Search by name or email...",
        filter: {
            title: "Filter",
            options: "Filter Options",
            reset: "Reset",
            apply: "Apply",
            role: "Role",
            status: "Account Status",
            kyc: "eKYC Status",
            sort: "Sort By"
        },
        roles: {
            all: "All Roles",
            super_admin: "Super Admin",
            admin: "Admin",
            manager: "Manager",
            host: "Host",
            guest: "Guest",
            staff: "Staff",
            renter: "Customer"
        },
        status: {
            all: "All Statuses",
            active: "Active",
            suspended: "Suspended",
            pending: "Pending",
            blocked: "Blocked"
        }
    },
    points: {
        title: "Points & Rewards",
        subtitle: "Earning rules, reward catalog and transactions",
        tabs: {
            rules: "Point Rules",
            rewards: "Reward Catalog",
            transactions: "Transactions"
        },
        rules: {
            actionName: "Action",
            pointsEarned: "Points earned",
            description: "Description",
            isActive: "Active",
            addRule: "Add rule",
            editRule: "Edit rule",
            deleteRule: "Delete rule",
            noRules: "No rules yet",
            emptyRuleCta: "No earning rules yet. Create your first rule!",
            refresh: "Refresh"
        },
        rewards: {
            name: "Reward name",
            pointsRequired: "Points required",
            stock: "Stock",
            imageUrl: "Image URL",
            addReward: "Add reward",
            editReward: "Edit reward",
            deleteReward: "Delete reward",
            noRewards: "No rewards yet",
            emptyRewardCta: "No rewards in catalog yet. Add your first reward!",
            unlimited: "Unlimited"
        },
        transactions: {
            userId: "User ID",
            load: "Load",
            userFullName: "User",
            points: "Points",
            type: "Type",
            typeEarn: "Earn",
            typeRedeem: "Redeem",
            reason: "Reason",
            date: "Date",
            noTransactions: "No transactions"
        },
        error: {
            fetchRules: "Could not load rules",
            fetchRewards: "Could not load reward catalog",
            fetchTransactions: "Could not load transactions",
            fetchConfig: "Could not load config",
            updateConfig: "Could not update config"
        },
        success: {
            ruleCreated: "Rule created",
            ruleUpdated: "Rule updated",
            ruleDeleted: "Rule deleted",
            rewardCreated: "Reward created",
            rewardUpdated: "Reward updated",
            rewardDeleted: "Reward deleted",
            configUpdated: "Conversion rate updated"
        },
        confirmDelete: "Are you sure you want to delete?",
        globalSettings: "Global Settings",
        conversionRate: "Conversion rate (Points → VNĐ)",
        conversionRateLink: "Edit conversion rate in System Settings",
        conversionLabel: "1 Point =",
        conversionSuffix: "VNĐ",
        saveConfig: "Save"
    }
};
