        .appointment {
            margin: 150px;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            border: 1px solid #f0f0f0;
            position: relative;
            overflow: hidden;
        }

        .appointment::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #3E2723, #8B0000, #2E7D32);            background-size: 400% 400%;
            animation: gradientShift 3s ease infinite;
        }

        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }

        .main-title {
            font-size: 2.5rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #C4A880, #9F2305);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: titlePulse 2s ease-in-out infinite;
        }

        @keyframes titlePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }

        .sub-title {
            text-align: center;
            font-size: 1.2rem;
            color: #000000;
            margin-bottom: 40px;
            opacity: 0;
            animation: fadeInUp 1s ease 0.3s forwards;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .form-group {
            position: relative;
            margin-bottom: 25px;
            opacity: 0;
            animation: slideInLeft 0.6s ease forwards;
        }

        .form-group:nth-child(even) {
            animation: slideInRight 0.6s ease forwards;
        }

        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .full-width {
            grid-column: 1 / -1;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
            transition: color 0.3s ease;
        }

        .required {
            color: #e74c3c;
            font-weight: bold;
        }

        input, select, textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #fafbfc;
            position: relative;
        }

        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #4CAF50;
            background: white;
            box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
            transform: translateY(-2px);
        }

        input:hover, select:hover, textarea:hover {
            border-color: #c3c8ce;
            transform: translateY(-1px);
        }

        textarea {
            resize: vertical;
            min-height: 100px;
        }

      

        /* Calendar Styles */
        .calendar-container {
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            overflow: hidden;
            background: white;
            margin-top: 10px;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-bottom: 1px solid #e1e5e9;
        }

        .calendar-nav {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .calendar-nav:hover {
            background: #45a049;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .calendar-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: #333;
        }

        .calendar {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: #e1e5e9;
        }

        .calendar-day {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            position: relative;
        }

        .calendar-day:hover {
            background: #e8f5e8;
            transform: scale(1.05);
        }

        .calendar-day.disabled {
            background: #f8f9fa;
            color: #ccc;
            cursor: not-allowed;
        }

        .calendar-day.disabled:hover {
            transform: none;
            background: #f8f9fa;
        }

        .calendar-day.selected {
            background: #4CAF50;
            color: white;
            font-weight: bold;
        }

        .calendar-day.selected::after {
            content: '✓';
            position: absolute;
            top: 2px;
            right: 2px;
            font-size: 10px;
        }

        .time-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin-top: 15px;
        }

        .time-slot {
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;
            font-weight: 500;
            position: relative;
            overflow: hidden;
        }

        .time-slot::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.1), transparent);
            transition: left 0.5s ease;
        }

        .time-slot:hover::before {
            left: 100%;
        }

        .time-slot:hover {
            border-color: #4CAF50;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
        }

        .time-slot.selected {
            background: #4CAF50;
            color: white;
            border-color: #4CAF50;
        }

        .time-slot.unavailable {
            background: #f8f9fa;
            color: #999;
            cursor: not-allowed;
            text-decoration: line-through;
        }

        .time-slot.unavailable:hover {
            transform: none;
            border-color: #e1e5e9;
            box-shadow: none;
        }

        .submit-btn {
            width: 100%;
            padding: 16px 32px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 30px;
            position: relative;
            overflow: hidden;
        }

        .submit-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.6s ease;
        }

        .submit-btn:hover::before {
            width: 400px;
            height: 400px;
        }

        .submit-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
        }

        .submit-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        /* Responsive Design */

        /* Large desktops (1200px – 1399px) */
        @media (max-width: 1399px) {
            .appointment {
                margin: 100px;
            }
        }

        /* Medium desktops / laptops (992px – 1199px) */
        @media (max-width: 1199px) {
            .appointment {
                margin: 60px;
                padding: 35px;
            }
            
            .main-title {
                font-size: 2.2rem;
            }
            
            .time-grid {
                grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
            }
        }

        /* Tablets landscape (768px – 991px) */
        @media (max-width: 991px) {
            .appointment {
                margin: 40px;
                padding: 30px;
            }
            
            .main-title {
                font-size: 2rem;
            }
            
            .sub-title {
                font-size: 1.1rem;
                margin-bottom: 30px;
            }
            
            .form-row {
                gap: 15px;
            }
            
            .calendar-header {
                padding: 12px 15px;
            }
            
            .calendar-title {
                font-size: 1.1rem;
            }
            
            .time-grid {
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 10px;
            }
        }

        /* Tablets portrait / small devices (≤ 767px) */
        @media (max-width: 767px) {
            .appointment {
                margin: 20px;
                padding: 25px;
            }
            
            .main-title {
                font-size: 1.8rem;
            }
            
            .sub-title {
                font-size: 1rem;
                margin-bottom: 25px;
            }
            
            .form-row {
                grid-template-columns: 1fr;
                gap: 0;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            input, select, textarea {
                padding: 10px 14px;
                font-size: 14px;
            }
            
            .calendar-header {
                padding: 10px 12px;
                flex-direction: column;
                gap: 10px;
            }
            
            .calendar-nav {
                padding: 6px 12px;
                font-size: 14px;
            }
            
            .calendar-title {
                font-size: 1rem;
            }
            
            .time-grid {
                grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
                gap: 8px;
            }
            
            .time-slot {
                padding: 10px 12px;
                font-size: 14px;
            }
            
            .submit-btn {
                padding: 14px 28px;
                font-size: 1rem;
                margin-top: 25px;
            }
        }

        /* Large phones / small tablets (481px – 640px) */
        @media (max-width: 640px) {
            .appointment {
                margin: 15px;
                padding: 20px;
            }
            
            .main-title {
                font-size: 1.6rem;
            }
            
            .calendar-header {
                padding: 8px 10px;
            }
            
            .calendar-day {
                font-size: 14px;
            }
            
            .time-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        /* Phones (≤ 480px) */
        @media (max-width: 480px) {
            .appointment {
                margin: 10px;
                padding: 15px;
                border-radius: 15px;
            }
            
            .main-title {
                font-size: 1.4rem;
                margin-bottom: 8px;
            }
            
            .sub-title {
                font-size: 0.9rem;
                margin-bottom: 20px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            label {
                margin-bottom: 6px;
                font-size: 14px;
            }
            
            input, select, textarea {
                padding: 8px 12px;
                font-size: 14px;
                border-radius: 8px;
            }
            
            textarea {
                min-height: 80px;
            }
            
            .calendar-container {
                border-radius: 8px;
            }
            
            .calendar-header {
                padding: 8px;
            }
            
            .calendar-nav {
                padding: 5px 10px;
                font-size: 12px;
                border-radius: 6px;
            }
            
            .calendar-title {
                font-size: 0.9rem;
            }
            
            .calendar-day {
                font-size: 12px;
            }
            
            .time-grid {
                grid-template-columns: 1fr 1fr;
                gap: 6px;
            }
            
            .time-slot {
                padding: 8px 10px;
                font-size: 12px;
                border-radius: 8px;
            }
            
            .submit-btn {
                padding: 12px 24px;
                font-size: 0.9rem;
                margin-top: 20px;
                border-radius: 8px;
            }
        }

        /* Very small phones (≤ 320px) */
        @media (max-width: 320px) {
            .appointment {
                margin: 5px;
                padding: 12px;
            }
            
            .main-title {
                font-size: 1.2rem;
            }
            
            .sub-title {
                font-size: 0.8rem;
            }
            
            .form-group {
                margin-bottom: 12px;
            }
            
            input, select, textarea {
                padding: 6px 10px;
                font-size: 13px;
            }
            
            .calendar-header {
                padding: 6px;
                gap: 8px;
            }
            
            .calendar-nav {
                padding: 4px 8px;
                font-size: 11px;
            }
            
            .calendar-title {
                font-size: 0.8rem;
            }
            
            .calendar-day {
                font-size: 11px;
            }
            
            .time-grid {
                grid-template-columns: 1fr;
            }
            
            .time-slot {
                padding: 6px 8px;
                font-size: 11px;
            }
            
            .submit-btn {
                padding: 10px 20px;
                font-size: 0.8rem;
            }
        }

        /* Small devices in landscape (≤ 500px height) */
        @media (max-height: 500px) and (orientation: landscape) {
            .appointment {
                margin: 10px;
                padding: 15px;
            }
            
            .main-title {
                font-size: 1.3rem;
                margin-bottom: 5px;
            }
            
            .sub-title {
                font-size: 0.9rem;
                margin-bottom: 15px;
            }
            
            .form-group {
                margin-bottom: 10px;
            }
            
            .calendar-header {
                padding: 6px 10px;
            }
            
            .calendar-day {
                font-size: 12px;
            }
            
            .time-slot {
                padding: 6px 10px;
                font-size: 12px;
            }
            
            .submit-btn {
                margin-top: 15px;
                padding: 10px 24px;
            }
        }